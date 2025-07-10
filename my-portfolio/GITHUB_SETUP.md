# GitHub API Setup Guide

This guide will help you set up real GitHub data integration for your portfolio.

## 🔑 Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Portfolio API Access"
4. Select the following scopes:
   - `public_repo` (to read public repository data)
   - `read:user` (to read user profile information)
   - `read:email` (optional, for additional user info)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again!

## 📝 Step 2: Create Environment File

Create a `.env` file in your project root (`my-portfolio/.env`):

```env
# GitHub API Configuration
VITE_GITHUB_TOKEN=your_github_personal_access_token_here
VITE_GITHUB_USERNAME=your_github_username_here
```

**Replace the values:**
- `your_github_personal_access_token_here` with the token you just created
- `your_github_username_here` with your actual GitHub username

## 🔒 Step 3: Security Best Practices

1. **Never commit your `.env` file** - it should already be in `.gitignore`
2. **Keep your token secure** - treat it like a password
3. **Use minimal permissions** - only grant the scopes you need
4. **Rotate tokens regularly** - create new tokens periodically

## 🚀 Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the GitHub section of your portfolio
3. You should see your real GitHub data:
   - Your actual repositories
   - Real star and fork counts
   - Your actual language distribution
   - Real repository descriptions and topics

## 🔧 Step 5: Customize Your GitHub Username

If you want to change the GitHub username being displayed, update the `VITE_GITHUB_USERNAME` in your `.env` file.

## 📊 What Data Will Be Displayed

The GitHub integration will show:

### Repository Information:
- Repository names and descriptions
- Programming languages used
- Star and fork counts
- Last updated dates
- Repository topics/tags
- Public/private status

### Statistics:
- Total number of repositories
- Total stars received
- Total forks
- Language distribution (calculated from repository sizes)
- Repository activity (stars/forks chart)

### Charts and Visualizations:
- Language distribution pie chart
- Repository activity bar chart
- Coding activity over time (line chart)
- Contribution graph (30-day view)

## 🛠️ Troubleshooting

### "Failed to load GitHub data" Error
1. Check that your GitHub token is correct
2. Verify your GitHub username is correct
3. Ensure the token has the required permissions
4. Check your internet connection

### Rate Limiting Issues
- GitHub API has rate limits (60 requests/hour for unauthenticated, 5000/hour for authenticated)
- If you hit limits, wait an hour or check your token configuration

### Empty Repository List
1. Make sure you have public repositories
2. Check that your username is correct
3. Verify the token has `public_repo` permission

### Language Distribution Issues
- Languages are calculated based on repository sizes
- Only repositories with detected languages will be included
- The calculation uses GitHub's language detection

## 🔄 Updating Data

The GitHub data will be fetched fresh each time you load the page. To update:
1. Make changes to your GitHub repositories
2. Refresh the portfolio page
3. New data will be automatically loaded

## 📱 API Endpoints Used

The integration uses these GitHub API endpoints:
- `GET /users/{username}/repos` - Repository list
- `GET /users/{username}` - User profile information
- `GET /repos/{owner}/{repo}/languages` - Repository languages

## 🎯 Next Steps

Once you have real GitHub data working:
1. Customize the styling to match your portfolio theme
2. Add more charts or visualizations as needed
3. Consider adding repository-specific features
4. Implement caching for better performance

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your GitHub token and username
3. Test the GitHub API directly in your browser
4. Check GitHub's API status page

---

**Remember:** Keep your GitHub token secure and never share it publicly! 