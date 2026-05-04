using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using UserService.Api.Constants;
using UserService.Api.DTOs.Auth;
using UserService.Api.DTOs.User;
using UserService.Api.Services.Interfaces;

namespace UserService.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public UsersController(
        IUserService userService,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _userService = userService;
        _environment = environment;
        _configuration = configuration;
    }

   
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<UserResponse>> Register([FromForm] RegisterRequest request)
    {
        try
        {
            if (request.ProfileImageFile is not null)
            {
                request.ProfileImageUrl = await SaveProfileImageAsync(request.ProfileImageFile);
            }

            var user = await _userService.RegisterAsync(request);
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserResponse>> Create([FromForm] CreateUserRequest request)
    {
        if (request.ProfileImageFile is not null)
        {
            request.ProfileImageUrl = await SaveProfileImageAsync(request.ProfileImageFile);
        }

        var user = await _userService.CreateAsync(request);
        return Ok(user);
    }

  
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _userService.GetAllAsync());
    }

    
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateUserRequest request)
    {
        try
        {
            if (request.ProfileImageFile is not null)
            {
                request.ProfileImageUrl = await SaveProfileImageAsync(request.ProfileImageFile);
            }

            var updated = await _userService.UpdateAsync(id, request);
            return updated == null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

 
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMe([FromForm] UpdateUserRequest request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized(new { message = "Token invalide : email manquant." });

        var user = await _userService.GetByEmailAsync(email);

        if (user == null) return NotFound();

        if (request.ProfileImageFile is not null)
        {
            request.ProfileImageUrl = await SaveProfileImageAsync(request.ProfileImageFile);
        }

        var updated = await _userService.UpdateAsync(user.Id, request);
        return Ok(updated);
    }

   
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _userService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private async Task<string> SaveProfileImageAsync(IFormFile file)
    {
        const long maxSize = 5 * 1024 * 1024;
        var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Format d'image non supporte. Utilisez jpg, jpeg, png ou webp.");
        }

        if (file.Length <= 0 || file.Length > maxSize)
        {
            throw new InvalidOperationException("La photo de profil doit faire au maximum 5 Mo.");
        }

        var webRootPath = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var uploadsDirectory = Path.Combine(webRootPath, "uploads", "profiles");
        Directory.CreateDirectory(uploadsDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var filePath = Path.Combine(uploadsDirectory, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var publicBaseUrl = _configuration["PublicBaseUrl"] ?? "http://localhost:8082";
        return $"{publicBaseUrl.TrimEnd('/')}/uploads/profiles/{fileName}";
    }
}
