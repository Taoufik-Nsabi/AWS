package ma.sirmaroc.matchs.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import ma.sirmaroc.matchs.dto.ExternalMatchResponse;
import ma.sirmaroc.matchs.integration.apifootball.ApiFootballClient;
import ma.sirmaroc.matchs.integration.apifootball.ApiFootballProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExternalMatchQueryService {

    private final ApiFootballClient apiFootballClient;
    private final ApiFootballProperties apiFootballProperties;

    public List<ExternalMatchResponse> getMatches(Integer competitionId,
                                                  LocalDate dateFrom,
                                                  LocalDate dateTo,
                                                  String status,
                                                  Integer limit) {
        if (!apiFootballProperties.isEnabled() || !StringUtils.hasText(apiFootballProperties.getApiKey())) {
            return List.of();
        }

        JsonNode root = competitionId != null
                ? apiFootballClient.getCompetitionMatches(competitionId, dateFrom, dateTo, status)
                : null;

        int max = limit != null && limit > 0 ? limit : 30;
        List<ExternalMatchResponse> result = competitionId != null
                ? extractMatches(root, max)
                : getPopularLeaguesMatches(dateFrom, dateTo, status, max);

        // If no matches were found for the exact date window, broaden the search window
        // so users still get useful fixtures around the selected day.
        if (result.isEmpty() && competitionId == null && dateFrom != null && dateTo != null && dateFrom.equals(dateTo)) {
            result = getPopularLeaguesMatches(dateFrom.minusDays(15), dateTo.plusDays(15), null, max);
        }

        if (result.isEmpty() && competitionId == null) {
            String leagues = normalizedPopularLeagues();
            if (StringUtils.hasText(leagues)) {
                JsonNode liveRoot = apiFootballClient.getLiveMatchesByLeagues(leagues);
                result = extractMatches(liveRoot, max);
            }
        }

        // Final fallback: latest finished fixtures to avoid an empty page.
        if (result.isEmpty() && competitionId == null) {
            result = getPopularLeaguesMatches(LocalDate.now().minusDays(21), LocalDate.now(), "FT-AET-PEN", max);
        }

        // Future date fallback: if the selected future day is empty, return the next fixtures known by API.
        if (result.isEmpty() && competitionId == null && dateFrom != null && dateTo != null
                && dateFrom.equals(dateTo) && dateFrom.isAfter(LocalDate.now())) {
            JsonNode nextRoot = apiFootballClient.getNextFixtures(max);
            result = extractMatches(nextRoot, max);
        }

        // Absolute fallback: ask API-FOOTBALL for the latest fixtures regardless of date.
        if (result.isEmpty() && competitionId == null) {
            JsonNode lastRoot = apiFootballClient.getLastFixtures(max);
            result = extractMatches(lastRoot, max);
        }

        result.sort(Comparator
                .comparingInt((ExternalMatchResponse m) -> statusPriority(m.getStatus()))
                .thenComparing(ExternalMatchResponse::getUtcDate, Comparator.nullsLast(String::compareTo)));

        return result;
    }

    private List<ExternalMatchResponse> getPopularLeaguesMatches(LocalDate dateFrom,
                                                                 LocalDate dateTo,
                                                                 String status,
                                                                 int max) {
        String leagues = normalizedPopularLeagues();
        if (!StringUtils.hasText(leagues)) {
            JsonNode root = apiFootballClient.getGlobalMatches(dateFrom, dateTo, status);
            return extractMatches(root, max);
        }

        Map<Integer, ExternalMatchResponse> uniqueByFixtureId = new LinkedHashMap<>();
        for (String leagueRaw : leagues.split(",")) {
            String trimmed = leagueRaw.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            int leagueId = Integer.parseInt(trimmed);
            int season = inferSeason(dateFrom);
            JsonNode root = apiFootballClient.getFixturesByLeagueAndSeason(leagueId, season, dateFrom, dateTo, status);
            for (ExternalMatchResponse match : extractMatches(root, max)) {
                if (match.getId() != null) {
                    uniqueByFixtureId.putIfAbsent(match.getId(), match);
                }
                if (uniqueByFixtureId.size() >= max) {
                    break;
                }
            }
            if (uniqueByFixtureId.size() >= max) {
                break;
            }
        }
        return new ArrayList<>(uniqueByFixtureId.values());
    }

    private int inferSeason(LocalDate date) {
        if (date == null) {
            return LocalDate.now().getYear();
        }
        // Most European seasons start in summer (July/August)
        return date.getMonthValue() >= 7 ? date.getYear() : date.getYear() - 1;
    }

    private String normalizedPopularLeagues() {
        String raw = apiFootballProperties.getPopularLeagues();
        if (!StringUtils.hasText(raw)) {
            return "";
        }
        return String.join(",",
                java.util.Arrays.stream(raw.split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .toList());
    }

    private List<ExternalMatchResponse> extractMatches(JsonNode root, int max) {
        JsonNode matches = root.path("response");
        if (!matches.isArray()) {
            String message = text(root.path("message"));
            String error = text(root.path("error"));
            if (StringUtils.hasText(message) || StringUtils.hasText(error)) {
                throw new IllegalStateException(StringUtils.hasText(message) ? message : error);
            }
            return List.of();
        }

        List<ExternalMatchResponse> result = new ArrayList<>();
        for (JsonNode match : matches) {
            if (result.size() >= max) {
                break;
            }
            result.add(ExternalMatchResponse.builder()
                    .id(match.path("fixture").path("id").isInt() ? match.path("fixture").path("id").asInt() : null)
                    .competition(text(match.path("league").path("name")))
                    .utcDate(text(match.path("fixture").path("date")))
                    .status(text(match.path("fixture").path("status").path("short")))
                    .stage(text(match.path("league").path("round")))
                    .matchday(null)
                    .venue(text(match.path("fixture").path("venue").path("name")))
                    .homeTeam(text(match.path("teams").path("home").path("name")))
                    .awayTeam(text(match.path("teams").path("away").path("name")))
                    .score(buildScore(match.path("goals")))
                    .build());
        }
        return result;
    }

    private int statusPriority(String status) {
        String normalized = status != null ? status.toUpperCase() : "";
        return switch (normalized) {
            case "LIVE", "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT" -> 0;
            case "NS", "TBD" -> 1;
            case "FT", "AET", "PEN" -> 2;
            default -> 4;
        };
    }

    private String buildScore(JsonNode goals) {
        String home = goals.path("home").isNull() ? "-" : goals.path("home").asText("-");
        String away = goals.path("away").isNull() ? "-" : goals.path("away").asText("-");
        return home + " - " + away;
    }

    private String text(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "";
        }
        String value = node.asText("");
        return StringUtils.hasText(value) ? value : "";
    }
}
