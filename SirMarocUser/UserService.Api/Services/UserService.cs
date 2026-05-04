using UserService.Api.DTOs.Auth;
using UserService.Api.DTOs.User;
using UserService.Api.Constants;
using UserService.Api.Entities;
using UserService.Api.Mappers;
using UserService.Api.Repositories.Interfaces;
using UserService.Api.Services.Interfaces;

namespace UserService.Api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;

    public UserService(IUserRepository userRepository, IPasswordService passwordService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
    }

    public async Task<List<UserResponse>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(UserMapper.ToResponse).ToList();
    }

    public async Task<UserResponse?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user is null ? null : UserMapper.ToResponse(user);
    }

    public async Task<UserResponse?> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        return user is null ? null : UserMapper.ToResponse(user);
    }

    public async Task<UserResponse> RegisterAsync(RegisterRequest request)
    {
        return await CreateInternalAsync(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.Origin,
            request.ProfileImageUrl,
            request.Password,
            UserRoles.User);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        return await CreateInternalAsync(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.Origin,
            request.ProfileImageUrl,
            request.Password,
            UserRoles.User);
    }

    private async Task<UserResponse> CreateInternalAsync(
        string firstName,
        string lastName,
        string email,
        string? phoneNumber,
        string? origin,
        string? profileImageUrl,
        string password,
        string role)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser is not null)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        var user = new User
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = string.IsNullOrWhiteSpace(phoneNumber) ? null : phoneNumber,
            Origin = string.IsNullOrWhiteSpace(origin) ? null : origin,
            ProfileImageUrl = string.IsNullOrWhiteSpace(profileImageUrl) ? null : profileImageUrl,
            Password = _passwordService.HashPassword(password),
            Role = role,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        return UserMapper.ToResponse(user);
    }

    public async Task<UserResponse?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            return null;
        }

        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser is not null && existingUser.Id != id)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber;
        user.Origin = string.IsNullOrWhiteSpace(request.Origin) ? null : request.Origin;
        user.ProfileImageUrl = string.IsNullOrWhiteSpace(request.ProfileImageUrl) ? null : request.ProfileImageUrl;
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.Password = _passwordService.HashPassword(request.Password);
        }
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return UserMapper.ToResponse(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            return false;
        }

        await _userRepository.DeleteAsync(user);
        return true;
    }
}
