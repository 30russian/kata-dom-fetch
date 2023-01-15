const url = 'https://api.github.com/search/repositories';

const searchField = document.querySelector('input');
const projects = document.querySelector('.projects');

class Suggestions {
  #liRepoMap;
  #suggestions;
  constructor() {
    this.#liRepoMap = new Map();
    this.#suggestions = null;
  }

  shouldAddProject = (event) => {
    if (this.#liRepoMap.has(event.target)) {
      addProject(this.#liRepoMap.get(event.target));
      searchField.value = '';
      this.render([]);
    }
  }

  render = (repos) => {
    if (this.#suggestions != null) {
      this.#suggestions.removeEventListener('click', this.shouldAddProject);
      this.#suggestions.remove();
      this.#suggestions = null;
    }

    if (repos.length === 0 && searchField.value.length === 0) {
      return;
    }

    this.#suggestions = document.createElement('ul');
    this.#suggestions.classList.add('suggestions');
    if(repos.length > 0 ) {
      for (let i = 0; i < Math.min(repos.length, 5); i++) {
        const repo = repos[i];
        const li = document.createElement('li');
        this.#liRepoMap.set(li, repo);
        li.textContent = repo.name;
        this.#suggestions.append(li);
      }
      this.#suggestions.addEventListener('click', this.shouldAddProject);
    } else {
      const li = document.createElement('li');
      li.textContent = 'No matches found';
      this.#suggestions.append(li);
    }
    searchField.after(this.#suggestions);
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
  lis[0].textContent = `Name: ${project.name}`;
  lis[1].textContent = `Owner: ${project.owner.login}`;
  lis[2].textContent = `Stars: ${project.stargazers_count}`;
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
  debouncedGetRepos(this.value, suggestions.render);
});

projects.addEventListener('click', (event) => {
  if (event.target.matches('.github-project__close-button')) {
    event.target.closest('li').remove();
  }
});