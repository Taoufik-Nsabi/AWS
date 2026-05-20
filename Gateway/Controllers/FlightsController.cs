using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SirmarocGateway.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/flights")]
public class FlightsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public FlightsController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string departure, [FromQuery] string arrival, [FromQuery] string date)
    {
        if (string.IsNullOrWhiteSpace(departure) || string.IsNullOrWhiteSpace(arrival))
        {
            return BadRequest(new { message = "departure and arrival are required." });
        }

        var outboundDate = date;
        if (!DateOnly.TryParse(date, out _))
        {
            outboundDate = DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd");
        }

        var apiKey = _configuration["SerpApi:ApiKey"] ?? _configuration["SERPAPI_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return Ok(new
            {
                best_flights = BuildDemoFlights(departure, arrival, outboundDate),
                is_demo = true,
                message = "Resultats de demonstration retournes car SERPAPI_API_KEY n'est pas configuree."
            });
        }

        var query = new Dictionary<string, string?>
        {
            ["engine"] = "google_flights",
            ["api_key"] = apiKey,
            ["departure_id"] = departure,
            ["arrival_id"] = arrival,
            ["outbound_date"] = outboundDate,
            ["type"] = "2",
            ["hl"] = "fr",
            ["gl"] = "ma",
            ["currency"] = "MAD"
        };

        var queryString = string.Join("&", query
            .Where(kv => !string.IsNullOrWhiteSpace(kv.Value))
            .Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value!)}"));

        var url = $"https://serpapi.com/search.json?{queryString}";

        var client = _httpClientFactory.CreateClient();
        using var response = await client.GetAsync(url);
        var payload = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, payload);
        }

        return Content(payload, "application/json");
    }

    private static object[] BuildDemoFlights(string departure, string arrival, string outboundDate)
    {
        var travelDate = DateOnly.TryParse(outboundDate, out var parsedDate)
            ? parsedDate
            : DateOnly.FromDateTime(DateTime.UtcNow);

        return new object[]
        {
            BuildDemoFlight("Royal Air Maroc", departure, arrival, travelDate, "08:10", "11:25", "3h 15m", "1,950 MAD", 0, 812),
            BuildDemoFlight("Air Arabia Maroc", departure, arrival, travelDate, "12:40", "16:30", "3h 50m", "1,480 MAD", 1, 214),
            BuildDemoFlight("Transavia", departure, arrival, travelDate, "18:25", "22:05", "3h 40m", "1,620 MAD", 0, 557),
        };
    }

    private static object BuildDemoFlight(
        string airline,
        string departure,
        string arrival,
        DateOnly travelDate,
        string departureTime,
        string arrivalTime,
        string duration,
        string price,
        int stops,
        int flightNumberSuffix)
    {
        var normalizedDeparture = departure.Trim().ToUpperInvariant();
        var normalizedArrival = arrival.Trim().ToUpperInvariant();

        return new
        {
            airline,
            price,
            total_duration = duration,
            layovers = stops == 0
                ? Array.Empty<object>()
                : new object[] { new { airport = "ESCALE", duration = "1h 05m" } },
            flights = new object[]
            {
                new
                {
                    airline,
                    flight_number = $"{airline.Split(' ', StringSplitOptions.RemoveEmptyEntries)[0].ToUpperInvariant()} {flightNumberSuffix}",
                    departure_airport = new
                    {
                        name = $"{normalizedDeparture} Airport",
                        time = $"{travelDate:yyyy-MM-dd} {departureTime}"
                    },
                    arrival_airport = new
                    {
                        name = $"{normalizedArrival} Airport",
                        time = $"{travelDate:yyyy-MM-dd} {arrivalTime}"
                    }
                }
            }
        };
    }
}
