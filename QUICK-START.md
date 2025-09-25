# Quick Setup Commands

## 🚀 **Immediate Setup (Copy & Paste)**

Run these commands in your PowerShell terminal:

```powershell
# 1. Navigate to your project
cd "c:\Users\User\CODERIST\chatbot"

# 2. Ensure package-lock.json exists
npm install --package-lock-only

# 3. Add all files to git
git add .

# 4. Commit changes
git commit -m "feat: add complete CI/CD pipeline with environments"

# 5. Push to GitHub
git push origin main

# 6. Check if you need to create the main branch
git branch -M main
git push -u origin main
```

## 📝 **GitHub Web Interface Tasks**

After running the commands above, do these in your browser:

### ⚙️ **Repository Settings:**

1. **Go to:** `https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/settings`

2. **Branch Protection:**

   - Click "Branches" → "Add protection rule"
   - Branch name: `main`
   - Check: "Require pull request before merging"
   - Check: "Require status checks to pass"
   - Save

3. **Environments:**

   - Click "Environments" → "New environment"
   - Name: `production` → Save
   - Name: `staging` → Save

4. **Secrets:**
   - Click "Secrets and variables" → "Actions" → "New repository secret"
   - Add these secrets:

| Name                 | Value                                                                      |
| -------------------- | -------------------------------------------------------------------------- |
| `GEMINI_API_KEY`     | Your actual Gemini API key                                                 |
| `PRODUCTION_API_KEY` | Generate with: `[System.Web.Security.Membership]::GeneratePassword(32, 0)` |

## 🧪 **Test Your Setup:**

```powershell
# Test 1: Trigger CI/CD
echo "# Test change" >> README.md
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main

# Test 2: Create a release
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0
```

## 📊 **Verify Success:**

1. **Actions Tab:** See green checkmarks ✅
2. **Packages Tab:** See Docker images 🐳
3. **Releases Tab:** See v1.0.0 release 🎉

## 🔧 **Common Fixes:**

### If Actions Fail:

```powershell
# Re-run failed workflows
git commit --allow-empty -m "retrigger workflows"
git push origin main
```

### If Container Registry Fails:

1. Go to Settings → Actions → General
2. Workflow permissions → Read and write permissions ✅
3. Save

## 🎯 **Quick Success Check:**

After setup, you should see:

- ✅ Green workflows in Actions tab
- ✅ Docker images in Packages tab
- ✅ Automatic dependency updates as PRs
- ✅ Security scanning results

**Your CI/CD is working when:** Every push triggers automatic testing, building, and deployment! 🚀
