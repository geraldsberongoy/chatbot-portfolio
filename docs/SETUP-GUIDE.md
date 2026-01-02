# 🚀 Complete CI/CD Setup Guide for Beginners

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ Your code pushed to a GitHub repository
- ✅ A GitHub account
- ✅ Your Gemini API key ready (if using AI features)

---

## 🗂️ **STEP 1: Prepare Your Repository**

### 1.1 Push All Changes to GitHub

```bash
# In your project folder
git add .
git commit -m "feat: add CI/CD pipeline and environment configs"
git push origin main
```

### 1.2 Verify Files Are Uploaded

Go to your GitHub repository and make sure these files are there:

- `.github/workflows/` folder with all workflow files
- `.env.production` and `.env.staging` files
- `package-lock.json` file

---

## ⚙️ **STEP 2: Configure Your GitHub Repository**

### 2.1 Enable GitHub Actions

1. **Go to your GitHub repository**
2. **Click on "Actions" tab** (top menu)
3. **GitHub Actions should be automatically enabled**
   - If you see "Get started with GitHub Actions", it's already enabled
   - If you see a message about enabling Actions, click "Enable"

### 2.2 Set Up Branch Protection on Main

1. **Go to Settings tab** in your repository
2. **Click "Branches"** in the left sidebar
3. **Click "Add protection rule"**
4. **Configure the rule:**
   - **Branch name pattern:** `main`
   - ✅ **Check "Require a pull request before merging"**
   - ✅ **Check "Require status checks to pass before merging"**
   - ✅ **Check "Require branches to be up to date before merging"**
   - In the search box that appears, type and select:
     - `Test & Code Quality`
     - `Docker Build & Test`
   - ✅ **Check "Restrict pushes to matching branches"**
5. **Click "Create"**

### 2.3 Create GitHub Environments

#### Create Production Environment:

1. **Go to Settings → Environments**
2. **Click "New environment"**
3. **Name:** `production`
4. **Configure protection rules:**
   - ✅ **Check "Required reviewers"** (add yourself)
   - **Deployment branches:** Select "Protected branches"
5. **Click "Save protection rules"**

#### Create Staging Environment:

1. **Click "New environment"** again
2. **Name:** `staging`
3. **Deployment branches:** Select "No restriction"
4. **Click "Save protection rules"**

---

## 🔐 **STEP 3: Add Environment Variables and Secrets**

### 3.1 Repository Secrets (Global)

1. **Go to Settings → Secrets and variables → Actions**
2. **Click "New repository secret"**
3. **Add these secrets one by one:**

| Secret Name          | Value                      | Description             |
| -------------------- | -------------------------- | ----------------------- |
| `GEMINI_API_KEY`     | Your actual Gemini API key | For AI features         |
| `PRODUCTION_API_KEY` | A secure random string     | Optional API protection |

**How to generate a secure API key:**

```bash
# Run this in PowerShell to generate a random key
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 3.2 Environment-Specific Secrets

#### For Production Environment:

1. **Go to Settings → Environments**
2. **Click "production"**
3. **Add environment secrets:**

| Secret Name       | Value                       |
| ----------------- | --------------------------- |
| `GEMINI_API_KEY`  | Your Gemini API key         |
| `API_KEY`         | Your secure API key         |
| `ALLOWED_ORIGINS` | `https://yourportfolio.com` |

#### For Staging Environment:

1. **Click "staging"**
2. **Add environment secrets:**

| Secret Name       | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| `ALLOWED_ORIGINS` | `http://localhost:3000,https://staging.yourportfolio.com` |

---

## 🧪 **STEP 4: Test Your CI/CD Pipeline**

### 4.1 Test Automatic Actions

1. **Make a small change to any file** (like README.md)
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "test: trigger CI/CD pipeline"
   git push origin main
   ```
3. **Watch the Actions tab:**
   - Go to your repo → Actions tab
   - You should see a new workflow running
   - Click on it to see progress

### 4.2 Test Pull Request Workflow

1. **Create a new branch:**
   ```bash
   git checkout -b test-pr
   ```
2. **Make a change and push:**
   ```bash
   echo "Test change" >> README.md
   git add .
   git commit -m "test: PR workflow"
   git push origin test-pr
   ```
3. **Create a Pull Request:**
   - Go to GitHub → Pull requests → New pull request
   - Select `test-pr` → `main`
   - Create the pull request
   - Watch the automatic tests run

### 4.3 Test Release Creation

1. **Create and push a tag:**
   ```bash
   git checkout main
   git tag -a v1.0.0 -m "First release"
   git push origin v1.0.0
   ```
2. **Check GitHub Releases:**
   - Go to your repo → Releases
   - You should see a new release created automatically

---

## 📊 **STEP 5: Monitor Your Pipeline**

### 5.1 Check Pipeline Status

- **Green checkmark** ✅ = Success
- **Red X** ❌ = Failed
- **Yellow circle** 🟡 = Running

### 5.2 View Logs

1. **Click on any workflow run**
2. **Click on individual jobs** to see detailed logs
3. **Expand steps** to see what happened

### 5.3 Common Issues and Solutions

#### ❌ "Dependencies lock file is not found"

**Solution:** Make sure `package-lock.json` exists

```bash
npm install --package-lock-only
git add package-lock.json
git commit -m "add package-lock.json"
git push
```

#### ❌ "Docker build failed"

**Solution:** Check Dockerfile syntax and dependencies

#### ❌ "Environment secrets not found"

**Solution:** Double-check secret names match exactly (case-sensitive)

---

## 🎯 **STEP 6: Customize for Your Needs**

### 6.1 Update Registry References

In all workflow files, replace:

```yaml
REGISTRY: ghcr.io
# Change this line in ci-cd.yml:
image-ref: ghcr.io/yourusername/your-repository-name
```

### 6.2 Update Domain Names

In your environment files, replace:

```bash
ALLOWED_ORIGINS=https://yourportfolio.com
```

With your actual domain:

```bash
ALLOWED_ORIGINS=https://your-actual-domain.com
```

---

## ✅ **Success Checklist**

- [ ] Repository has all CI/CD files
- [ ] GitHub Actions is enabled
- [ ] Branch protection is set up on main
- [ ] Production and staging environments created
- [ ] Secrets are configured
- [ ] First workflow run completed successfully
- [ ] Pull request workflow tested
- [ ] Release workflow tested
- [ ] Container registry contains your images

---

## 🆘 **Need Help?**

### Check These First:

1. **Actions tab** - See workflow logs
2. **Security tab** - Check for security alerts
3. **Packages tab** - Verify container images

### Common Commands:

```bash
# See workflow status
git log --oneline -10

# Force rebuild
git commit --allow-empty -m "trigger rebuild"
git push

# Check current branch
git branch

# Reset if needed
git reset --hard HEAD~1
```

---

## 🎉 **Congratulations!**

You now have enterprise-grade CI/CD for your portfolio chatbot!

**What happens automatically:**

- ✅ Code testing on every change
- ✅ Security scanning
- ✅ Docker image building
- ✅ Automatic deployments
- ✅ Release management
- ✅ Dependency updates

**Next Steps:**

- Deploy to your preferred platform (Vercel, Railway, etc.)
- Set up monitoring and alerts
- Add more tests as your project grows

Your microservice is now ready for production! 🚀
