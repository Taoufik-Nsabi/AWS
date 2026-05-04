using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace UserService.Api.DTOs.User;

public class CreateUserRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Phone]
    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [MaxLength(150)]
    public string? Origin { get; set; }

    [MaxLength(500)]
    public string? ProfileImageUrl { get; set; }

    public IFormFile? ProfileImageFile { get; set; }

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    [RegularExpression(
     @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
     ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number.")]
    public string Password { get; set; } = string.Empty;

}
