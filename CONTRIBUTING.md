# Contributing to Find Me a Recipe

First off, thank you for considering contributing to Find Me a Recipe! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/find-me-a-recipe.git
   cd find-me-a-recipe
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Fordann/find-me-a-recipe.git
   ```
4. **Install dependencies**:
   ```bash
   npm start  # This will set up everything
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Frontend tests
cd client && npm test

# Backend tests
cd flask-server && python test_app.py

# Or with Docker
docker-compose exec flask python test_app.py
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing new feature"
```

See [Commit Messages](#commit-messages) for guidelines.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your branch
- Fill in the PR template with details

## Pull Request Process

1. **Ensure all tests pass** before submitting
2. **Update the README.md** with details of changes if needed
3. **Add/update tests** for new functionality
4. **Follow the code style** of the project
5. **Keep PRs focused** - one feature/fix per PR
6. **Be responsive** to feedback and requested changes

### PR Checklist

- [ ] Tests pass locally (`npm test` and `python test_app.py`)
- [ ] Code follows project style guidelines
- [ ] New code has appropriate tests
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventions
- [ ] No merge conflicts with main branch

## Coding Standards

### TypeScript/React (Frontend)

- **File naming**: PascalCase for components, camelCase for utilities
- **Components**: Functional components with TypeScript
- **Hooks**: Use built-in hooks (useState, useEffect, etc.)
- **Styling**: CSS modules or styled-components preferred
- **Props**: Always define TypeScript interfaces for props
- **Exports**: Use named exports for utilities, default for components

**Example:**
```typescript
interface RecipeCardProps {
  recipe: Recipe;
  onFavorite: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onFavorite }) => {
  // Component logic
};

export default RecipeCard;
```

### Python (Backend)

- **Code style**: Follow PEP 8
- **Type hints**: Use type annotations where appropriate
- **Docstrings**: Document functions and classes
- **Error handling**: Use try/except appropriately
- **Logging**: Use Python's logging module (not print statements)

**Example:**
```python
def fetch_recipe(recipe_name: str, language: str = 'en') -> dict:
    """
    Fetch detailed recipe information.
    
    Args:
        recipe_name: Name of the recipe to fetch
        language: Language code ('en' or 'fr')
    
    Returns:
        Dictionary containing recipe details
    
    Raises:
        ValueError: If recipe name is invalid
    """
    # Function logic
```

### CSS

- **Variables**: Use CSS custom properties from `variables.css`
- **Naming**: Use BEM-like naming convention
- **Units**: Use rem for fonts, px for borders/shadows
- **Colors**: Always use CSS variables, not hex codes

**Example:**
```css
.recipe-card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.recipe-card__title {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}
```

## Testing Guidelines

### Frontend Tests (Jest + React Testing Library)

- **Test behavior**, not implementation
- **Use semantic queries**: `getByRole`, `getByLabelText`, etc.
- **Test user interactions**: clicks, inputs, form submissions
- **Mock external dependencies**: API calls, context providers

**Example:**
```typescript
describe('RecipeCard', () => {
  test('renders recipe name', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
  });

  test('calls onFavorite when heart clicked', () => {
    const handleFavorite = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onFavorite={handleFavorite} />);
    
    fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
    expect(handleFavorite).toHaveBeenCalledWith(mockRecipe.id);
  });
});
```

### Backend Tests (unittest)

- **Test all endpoints**: success and error cases
- **Test edge cases**: empty inputs, invalid data
- **Test translation logic**: both languages
- **Mock external services**: web scraping, translation API

**Example:**
```python
class TestRecipeAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
    
    def test_search_recipes_success(self):
        response = self.app.post('/research_recipe', json={
            'ingredients': ['tomato', 'cheese'],
            'language': 'en'
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('recipes', data)
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(recipe): add serving size adjustment
fix(search): resolve duplicate results bug
docs(readme): update installation instructions
test(backend): add tests for translation module
refactor(cache): optimize recipe cache logic
```

## Questions?

Feel free to open an issue with the `question` label if you need help or clarification on anything.

Thank you for contributing! 🙏
