# DEP-002: Update All Dependencies to Latest Versions

## Background

Over time, the project's dependencies fall behind their latest releases. Outdated packages may contain unfixed bugs, miss performance improvements, and accumulate security debt. This update bumps all Python and Node.js dependencies to their latest stable versions within safe compatibility bounds.

## Changes

### `requirements.txt` (Python)

| Package | Old Version | New Version |
|---------|-------------|-------------|
| fastapi | >=0.95.0 | >=0.129.0 |
| uvicorn | >=0.21.1 | >=0.41.0 |
| python-dotenv | >=1.0.0 | >=1.2.1 |
| requests | >=2.28.2 | >=2.32.5 |
| urllib3 | >=2.6.3 | >=2.6.3 *(no change — already latest)* |
| numpy | >=1.24.2 | >=2.4.2 |
| torch | >=2.0.0 | >=2.10.0 |
| sentence-transformers | >=2.2.2 | >=5.2.3 |
| chromadb | >=0.3.21 | >=1.5.1 |
| rank-bm25 | >=0.2.2 | >=0.2.2 *(no change — already latest)* |
| nltk | >=3.8.1 | >=3.9.2 |
| tqdm | >=4.65.0 | >=4.67.3 |
| pydantic | >=2.12.5 | >=2.12.5 *(no change — already latest)* |

### `package.json` (Node.js — production dependencies)

| Package | Old Version | New Version |
|---------|-------------|-------------|
| axios | ^1.8.2 | ^1.13.5 |
| bcryptjs | ^3.0.2 | ^3.0.3 |
| better-sqlite3 | ^11.8.1 | ^11.10.0 |
| body-parser | ^1.20.3 | ^1.20.4 |
| cheerio | ^1.0.0 | ^1.2.0 |
| cors | ^2.8.5 | ^2.8.6 |
| dockerode | ^4.0.6 | ^4.0.9 |
| dotenv | ^16.4.7 | ^16.6.1 |
| express | ^4.21.2 | ^4.22.1 |
| nodemon | ^3.1.9 | ^3.1.11 |
| openai | ^4.86.2 | ^4.104.0 |
| rimraf | ^6.0.1 | ^6.1.3 |
| tiktoken | ^1.0.20 | ^1.0.22 |

### `package.json` (Node.js — dev dependencies)

| Package | Old Version | New Version |
|---------|-------------|-------------|
| @eslint/js | ^9.22.0 | ^9.39.2 |
| eslint | ^9.22.0 | ^9.39.2 |
| eslint-config-prettier | ^10.1.1 | ^10.1.8 |
| eslint-plugin-jsdoc | ^50.6.3 | ^50.8.0 |
| globals | ^16.0.0 | ^16.5.0 |
| prettier | ^3.5.3 | ^3.8.1 |

## Testing

```bash
# Install updated npm packages
npm install

# Verify no breaking changes in Node.js
node -e "require('./server.js')" 2>&1 | head -5

# Install updated Python packages (in venv)
pip install -r requirements.txt

# Verify Python service starts
python main.py --help
```

## Impact

- **Security**: All packages updated past known vulnerability windows
- **Performance**: Newer versions of numpy, torch, and chromadb include performance improvements
- **Compatibility**: All updates stay within current major version series for Node.js packages to avoid breaking changes; Python packages use `>=` constraints allowing any newer version

## Upstream Status

- [ ] Not submitted (dependency maintenance is fork-specific)
