const url = 'https://api.github.com/search/repositories';

const searchField = document.querySelector('input');
const projects = document.querySelector('.projects');

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

function renderSuggestions(repos) {
  let suggestions = document.querySelector('.suggestions');
  if (suggestions != null) {
    suggestions.remove();
  }

  if (repos.length === 0) {
    return;
  }

  const liRepoMap = new Map();
  suggestions = document.createElement('ul');
  suggestions.classList.add('suggestions');
  for (let i = 0; i < Math.min(repos.length, 5); i++) {
    const repo = repos[i];
    const li = document.createElement('li');
    liRepoMap.set(li, repo);
    li.textContent = repo.name;
    suggestions.append(li);
  }
  suggestions.addEventListener('click', (event) => {
    if (liRepoMap.has(event.target)) {
      addProject(liRepoMap.get(event.target));
      searchField.value = '';
      renderSuggestions([]);
    }
  })

  searchField.after(suggestions);
}

async function getRepos(query, onResult) {
  if (!query) {
    onResult([]);
  }

  const encodedUrl = new URL(url);
  encodedUrl.searchParams.set('q', query);
  // encodedUrl.searchParams.set('sort', 'stars');
  const response = await fetch(encodedUrl, {
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/json;charset=utf-8'
      'Accept': 'application/vnd.github+json'
    }
    // body: new URLSearchParams({
    //   q: query
    // })
  });
  const result = await response.json();
  onResult(result.items);
}
const debouncedGetRepos = debounce(getRepos, 1000);

searchField.addEventListener('input', function(event) {
  debouncedGetRepos(this.value, renderSuggestions);
});

projects.addEventListener('click', (event) => {
  if (event.target.matches('.github-project__close-button')) {
    event.target.closest('li').remove();
  }
});

renderSuggestions([]);