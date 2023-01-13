const url = 'https://api.github.com/search/repositories';

const searchField = document.querySelector('input');
const projects = document.querySelector('.projects');

class Suggestions {
  constructor() {
    this._liRepoMap = new Map();
    this._suggestions = null;
    this._clickListener = this.shouldAddProject.bind(this);
  }

  shouldAddProject(event) {
    if (this._liRepoMap.has(event.target)) {
      addProject(this._liRepoMap.get(event.target));
      searchField.value = '';
      this.render([]);
    }
  }

  render(repos) {
    if (this._suggestions != null) {
      this._suggestions.removeEventListener('click', this._clickListener);
      this._suggestions.remove();
      this._suggestions = null;
    }

    if (repos.length === 0) {
      return;
    }

    this._suggestions = document.createElement('ul');
    this._suggestions.classList.add('suggestions');
    for (let i = 0; i < Math.min(repos.length, 5); i++) {
      const repo = repos[i];
      const li = document.createElement('li');
      this._liRepoMap.set(li, repo);
      li.textContent = repo.name;
      this._suggestions.append(li);
    }
    this._suggestions.addEventListener('click', this._clickListener);

    searchField.after(this._suggestions);
  }
}

function debounce(fn, debounceTime) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  }
}

function addProject(project) {
  let projectLiTemplate = document.querySelector('#projects-li-template');

  let liClone = projectLiTemplate.content.cloneNode(true);
  let lis = liClone.querySelectorAll('ul > li');
  lis[0].textContent = project.name;
  lis[1].textContent = project.owner.login;
  lis[2].textContent = project.stargazers_count;
  projects.append(liClone);
}

async function getRepos(query, onResult) {
  if (!query) {
    onResult([]);
  }

  const encodedUrl = new URL(url);
  encodedUrl.searchParams.set('q', query);
  encodedUrl.searchParams.set('per_page', 5);
  const response = await fetch(encodedUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github+json'
    }
  });
  const result = await response.json();
  onResult(result.items ?? []);
}
const debouncedGetRepos = debounce(getRepos, 1000);

const suggestions = new Suggestions();
suggestions.render([]);
searchField.addEventListener('input', function(event) {
  debouncedGetRepos(this.value, suggestions.render.bind(suggestions));
});

projects.addEventListener('click', (event) => {
  if (event.target.matches('.github-project__close-button')) {
    event.target.closest('li').remove();
  }
});