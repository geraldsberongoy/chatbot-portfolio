# 🤖 Portfolio Chatbot Backend Microservice

A powerful backend microservice for portfolio chatbots that can answer questions about your professional background, projects, skills, and experience using AI or smart fallback responses.

## ✨ Features

- 🤖 **AI-Powered**: Supports Google Gemini API with smart fallback responses
- **Microservice Architecture**: RESTful API with versioning
- 🐳 **Docker Ready**: Containerized for easy deployment
- 🔒 **Security**: Optional API key authentication and rate limiting
- 📊 **Analytics**: Built-in usage tracking and analytics
- � **Backend-Only**: Pure API service for integration with any frontend

## 🚀 Quick Start

### API Usage Example

```javascript
fetch("https://your-chatbot-api.com/api/v1/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "What projects have you built?",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data.reply));
```

## 🛠️ Setup & Deployment

### Local Development

1. **Clone and install dependencies**:

   ```bash
   git clone <your-repo>
   cd portfolio-chatbot
   npm install
   ```

2. **Configure environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Add your portfolio data**:

   - Edit `data/portfolioData.json` with your information
   - Or set `PORTFOLIO_DATA_PATH` to your JSON file

4. **Start the service**:
   ```bash
   npm run microservice
   ```

### Docker Deployment

```bash
# Build and run with Docker
docker build -t portfolio-chatbot .
docker run -p 5000:5000 --env-file .env portfolio-chatbot

# Or use Docker Compose
docker-compose up -d
```

### Cloud Deployment

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Heroku

```bash
heroku create your-chatbot-name
git push heroku main
```

## 📋 API Documentation

### Base URL

```
https://your-api-domain.com/api/v1
```

### Endpoints

#### `POST /chat`

Send a message to the chatbot

**Request:**

```json
{
  "message": "What projects have you built?",
  "context": {} // optional
}
```

**Response:**

```json
{
  "reply": "I've built several exciting projects including...",
  "source": "gemini",
  "provider": "Google Gemini (Free)",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "v1"
}
```

#### `GET /health`

Health check endpoint

**Response:**

```json
{
  "status": "healthy",
  "server": "running",
  "providers": {
    "gemini": true,
    "fallback": true
  },
  "activeProvider": "gemini",
  "uptime": 3600,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### `GET /portfolio`

Get portfolio data (requires API key if configured)

#### `GET /analytics`

Get usage analytics (requires API key if configured)

#### `GET /docs`

Get complete API documentation

## 🎛️ Configuration

### Environment Variables

| Variable                | Description                                 | Default                       |
| ----------------------- | ------------------------------------------- | ----------------------------- |
| `PORTFOLIO_OWNER`       | Name of portfolio owner                     | `"Portfolio Owner"`           |
| `PORTFOLIO_DATA_PATH`   | Path to portfolio JSON data                 | `"./data/portfolioData.json"` |
| `AI_PROVIDER`           | AI provider to use (`gemini` or `fallback`) | `"fallback"`                  |
| `GEMINI_API_KEY`        | Google Gemini API key                       | `null`                        |
| `API_KEY`               | Optional API key for protected endpoints    | `null`                        |
| `ALLOWED_ORIGINS`       | Comma-separated list of allowed origins     | `true` (all)                  |
| `RATE_LIMIT_PER_MINUTE` | Rate limit per IP per minute                | `30`                          |
| `PORT`                  | Server port                                 | `5000`                        |
| `NODE_ENV`              | Environment mode                            | `"production"`                |

### Portfolio Data Format

Structure your `portfolioData.json` like this:

```json
{
  "profile": "Brief professional summary...",
  "projects": [
    {
      "name": "Project Name",
      "stack": ["React", "Node.js", "MongoDB"],
      "details": ["Description of the project..."]
    }
  ],
  "skills": {
    "languages": ["JavaScript", "Python", "Java"],
    "frameworks": ["React", "Express", "Flask"],
    "databases": ["MongoDB", "PostgreSQL"],
    "tools": ["Git", "Docker", "AWS"]
  },
  "experience": [
    {
      "organization": "Company Name",
      "role": "Software Developer",
      "date": "Jan 2023 - Present",
      "highlights": ["Built scalable web applications..."]
    }
  ],
  "education": {
    "school": "University Name",
    "degree": "B.S. Computer Science",
    "graduation": "May 2023",
    "coursework": ["Data Structures", "Algorithms"],
    "scholarships": ["Merit Scholarship"]
  },
  "certifications": [
    {
      "title": "AWS Certified Developer",
      "issuer": "Amazon",
      "date": "2023",
      "note": "Professional cloud development certification"
    }
  ],
  "contact": {
    "email": "you@example.com",
    "linkedin": "https://linkedin.com/in/yourname",
    "github": "https://github.com/yourname"
  }
}
```

## 🧪 Testing the API

### Using curl

```bash
# Test health endpoint
curl http://localhost:5000/api/v1/health

# Test chat endpoint
curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What projects have you built?"}'

# Test with API key (if configured)
curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"message": "What are your skills?"}'
```

### Using PowerShell

```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health"

# Test chat endpoint
$body = @{
    message = "What projects have you built?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/chat" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## 🔒 Security

### API Key Protection

Set `API_KEY` environment variable to protect sensitive endpoints:

- `/api/v1/portfolio`
- `/api/v1/analytics`

### Rate Limiting

Configure `RATE_LIMIT_PER_MINUTE` to prevent abuse.

### CORS Configuration

Set `ALLOWED_ORIGINS` to restrict cross-origin requests.

## 📊 Monitoring & Analytics

Visit `/api/v1/analytics` (with API key) to see:

- Total queries
- Popular keywords
- Provider usage statistics
- Uptime information

## 🚨 Troubleshooting

### Common Issues

1. **CORS errors**: Add your domain to `ALLOWED_ORIGINS`
2. **Rate limiting**: Check if you're exceeding the configured limit
3. **AI not working**: Verify your `GEMINI_API_KEY` is valid
4. **Authentication errors**: Verify your `X-API-Key` header

### Debug Mode

Set `NODE_ENV=development` for detailed error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

## 🆘 Support

- 📧 Email: your-email@example.com
- 💬 Discord: [Your Discord]
- 🐛 Issues: [GitHub Issues]

---

Made with ❤️ for the developer community
