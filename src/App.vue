<script setup>
import { ref, onMounted, computed } from 'vue';
import Files from './components/Files.vue';
import Alert from './components/Alert.vue';
import Preview from './components/Preview.vue';

import { drag } from './draggable';

const main = ref(null);
const titleBar = ref(null);

const repoBox = ref(null);
const pathBox = ref(null);

const cacheClearing = ref(false);

const loading = ref(false);

const error = ref(false);
const preview = ref(false);

const repo = ref('yinkar');
const path = ref('');
const address = ref('');
const content = ref('');
const previewTitle = ref('');
const isImage = ref(false);

const searchQuery = ref('');

const {
  positionX,
  positionY,
  titleMouseDown,
} = drag();

const visibleAddress = computed(() => {
  const repoNameArray = repo.value.split('/');

  if (repoNameArray.length < 2) return `[${repo.value}]`;
  if (path.value === '') return `[${repo.value}]`;

  return `[${repo.value}] > ${path.value.replaceAll('/', ' > ')}`;
});

const list = ref([]);

function setRepoAndPath(e) {
  if (e.key === 'Enter') {
    goAddress();
  }
}

function goAddress() {
  loading.value = true;

  repo.value = repoBox.value.value;
  path.value = pathBox.value.value;

  const repoNameArray = repo.value.split('/').filter(e => e);

  if (repoNameArray.length > 1) {
    address.value = `${repo.value}/contents/${path.value}`;
  }
  else {
    address.value = `${repo.value}`;
  }

  window.location.hash = `${repo.value}/${path.value}`.replace(/\/$/, '');

  const getCached = () => {
    const cachedData = window.sessionStorage.getItem(address.value);

    if (cachedData) {
      list.value.push(...JSON.parse(cachedData));

      loading.value = false;
      return true;
    }

    return false;
  };

  if (repoNameArray.length === 0) return;

  // Get repos on user
  else if (repoNameArray.length === 1) {
    const username = repoNameArray.at(0);

    (() => {
      list.value.splice(0);

      if (getCached()) return;

      const getRepos = async (page = 1) => {
        try {
          const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`);
          if (response.status !== 200) {
            error.value = true;
            return;
          }
          
          const data = await response.json();
            
          if (data.length > 0) {
            list.value.push(...data.map(e => {
              return {
                name: e.name,
                path: e.full_name,
                type: 'repo',
              };
            }).sort((a, b) => {
              return (b.type > a.type) ? -1 : (a.type > b.type) ? 1 : 0;
            }));

            window.sessionStorage.setItem(address.value, JSON.stringify(list.value));

            loading.value = false;

            getRepos(page + 1);
          };
        }
        catch (e) {
          error.value = true;
        }
      };
      
      getRepos(1);
    })();
  }

  // Get files of repo
  else {
    (() => {
      list.value.splice(0);

      if (getCached()) return;

      const getFiles = async () => {
        try {
          const response = await fetch(`https://api.github.com/repos/${address.value}`);
          if (response.status !== 200) {
            error.value = true;
            return;
          }

          const data = await response.json();

          if (data.length > 0) {
            list.value.splice(0);
            list.value.push(...data.sort((a, b) => {
              return (b.type > a.type) ? -1 : (a.type > b.type) ? 1 : 0;
            }));

            window.sessionStorage.setItem(address.value, JSON.stringify(list.value));

            loading.value = false;
          }
        }
        catch (e) {
          error.value = true;
        }
      };

      getFiles(1);
    })();
  }
}

function openRepo(repoPath) {
  repoBox.value.value = repoPath;
  searchQuery.value = '';
  goAddress();
}

function setPath(itemPath) {
  pathBox.value.value = itemPath;
  searchQuery.value = '';
  goAddress();
}

function openFile(url, name) {
  fetch(url)
    .then(r => r.text())
    .then(d => {
      const fileExtension = url.split('.').filter(e => e).at(-1);

      const setPreview = () => {
        preview.value = true;
        previewTitle.value = name;
      };

      const newTab = () => {    
       window.open(url, encodeURI(`file-${name}`));
      }

      isImage.value = false;

      if ([ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'jfif', 'webp' ].includes(fileExtension)) {
        setPreview();

        content.value = url;
        isImage.value = true;
      }
      else if ([ 'mp3', 'wav', 'ogg' ].includes(fileExtension)) {
        setPreview();

        content.value = `
          <div style="width: 100%; height: 100%;">
            <audio controls autoplay>
              <source src="${url}">  
            </audio>  
          </div>
        `;
      }
      else if ([ 'pdf', 'doc', 'xls' ].includes(fileExtension)) {
        newTab();
      }
      else if ([ 'ttf' ].includes(fileExtension)) {
        newTab();
      }
      else {
        setPreview();

        content.value = `<pre style="font-family: monospace; font-size: .63rem">${d.replace(/[\u00A0-\u9999<>\&]/gim, e => `&#${e.charCodeAt(0)};`)}</pre>`;
      }
  });
}

function toUp() {
  const pathArray = path.value.split('/');

  if (pathArray.length === 1 && pathArray.at(0) === '') {
    const repoNameArray = repo.value.split('/');

    if (repoNameArray.length <= 1) {
      goAddress();
      return;
    };

    repoBox.value.value = repoNameArray.at(0);
    goAddress();
    return;
  }

  pathArray.splice(-1);
  pathBox.value.value = pathArray.join('/');
  goAddress();
}

function closeAlert() {
  error.value = false;
  loading.value = false;
}

function closePreview(e) {
  e.stopImmediatePropagation();
  preview.value = false;
  content.value = '';
}

function clearCache() {
  loading.value = true;
  cacheClearing.value = true;

  window.sessionStorage.clear();

  list.value.splice(0);

  setTimeout(() => {
    cacheClearing.value = false;
    loading.value = false;
    goAddress();
  }, 1000);
}

onMounted(() => {
  const setAddressByHash = () => {
    if (window.location.hash !== '') {
      const hashArray = window.location.hash.substring(1).split('/');

      if (hashArray.length < 1) return;

      pathBox.value.value = hashArray.splice(2).join('/');
      repoBox.value.value = hashArray.join('/');
    }
  }
  setAddressByHash();
  goAddress();

  const boundingRect = main.value.getBoundingClientRect();

  if (window.innerWidth > 900) {
    positionX.value = window.innerWidth / 2 - boundingRect.width / 2;
    positionY.value = window.innerHeight / 2 - boundingRect.height / 2;
  }
  else {
    positionX.value = 0;
    positionY.value = 0;
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth < 900) {
      positionX.value = 0;
      positionY.value = 0;
    }
  });
  
  window.addEventListener('hashchange', () => {
    setAddressByHash();
    goAddress();
  });
});

</script>

<template>
  <div class="main-window window active glass" ref="main" :style="{ left: `${positionX}px`, top: `${positionY}px` }">
    <div class="title-bar" @mousedown="titleMouseDown" ref="titleBar">
      <div class="title-bar-text">{{ `${repo}/${path}`.split('/').filter(e => e).at(-1) }} - Github Explorer</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize" disabled></button>
        <button aria-label="Maximize" disabled></button>
        <button aria-label="Close" disabled></button>
      </div>
    </div>
    <div class="window-body has-space" style="min-height: 200px;">
      <div class="panel win7">
        <div class="field-row">
          <div class="input-group">
            <label for="repo">Repo: </label>
            <input type="text" ref="repoBox" @input="pathBox.value = ''" @keypress="setRepoAndPath" v-model="repo"
              id="repo" required>
          </div>

          <div class="input-group">
            <label for="path">Path: </label>
            <input type="text" ref="pathBox" @keypress="setRepoAndPath" v-model="path" id="path" required>
          </div>

          <div class="win7">
            <button @click="goAddress" :disabled="loading" class="default go-button">
              <svg width="18px" height="18px" fill="#146ff2" clip-rule="evenodd" fill-rule="evenodd"
                stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="m12.007 2c-5.518 0-9.998 4.48-9.998 9.998 0 5.517 4.48 9.997 9.998 9.997s9.998-4.48 9.998-9.997c0-5.518-4.48-9.998-9.998-9.998zm1.523 6.21s1.502 1.505 3.255 3.259c.147.147.22.339.22.531s-.073.383-.22.53c-1.753 1.754-3.254 3.258-3.254 3.258-.145.145-.335.217-.526.217-.192-.001-.384-.074-.531-.221-.292-.293-.294-.766-.003-1.057l1.977-1.977h-6.693c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6.693l-1.978-1.979c-.29-.289-.287-.762.006-1.054.147-.147.339-.221.53-.222.19 0 .38.071.524.215z"
                  fill-rule="nonzero" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      <div class="address-bar-container field-row">
        <div class="address-bar" :title="visibleAddress">{{ visibleAddress }}</div>

        <button @click="toUp" :disabled="loading">
          <img src="./assets/up.png" alt="Up" style="width: 20px; height: 20px;">
        </button>
      </div>

      <div class="search-bar-container field-row">
        <div class="input-group">
          <label for="repo">Search: </label>
          <input type="text" ref="searchBox" v-model="searchQuery"
            id="search">
        </div>
      </div>

      <div class="loading-container">
        <div v-show="loading" class="loading marquee" role="progressbar"></div>
      </div>

      <div class="tabs">
        <div role="tabpanel">
          <Files 
            :list="list.filter(
              e => e
                    .name
                    .replaceAll('-', ' ').
                    toLowerCase().
                    includes(searchQuery.toLowerCase())
            )" 
            :open-repo="openRepo" 
            :open-file="openFile" 
            :set-path="setPath"
          />
        </div>
      </div>
    </div>

    <div class="status-bar">
      <p class="status-bar-field" style="width: 90%">
        <a :href="`https://github.com/${repo}`" target="_blank">{{ `https://github.com/${repo}` }}</a>
      </p>
      <p class="status-bar-field" style="text-align: center;">
        <button @click="clearCache" class="clear-cache-button" title="Clear cache">
          <img src="./assets/clear-cache.png" alt="Clear cache" :class="{ 'cache-clearing' :cacheClearing }">
        </button>  
      </p>
    </div>
  </div>

  <Preview v-if="preview" :preview="preview" :close-preview="closePreview" :content="content" :title="previewTitle" :is-image="isImage" />

  <Alert v-if="error" :error="error" :close-alert="closeAlert" />
</template>

<style scoped>
.main-window {
  position: absolute;
  width: 500px;
}

.address-bar-container, .search-bar-container {
  margin: 10px 0 5px 0;
  height: 1rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.search-bar-container {
  margin-top: 20px;
}

.search-bar-container input {
  width: 350px;
}

.address-bar {
  width: 312px;
  border: 1px solid #eee;
  background-color: #ddd;
  color: #666;
  box-sizing: border-box;
  padding: 4px 10px;
  white-space: nowrap;
  overflow: auto;
}

.address-bar::-webkit-scrollbar {
  display: none;
}

.loading-container {
  height: 20px;
  padding: 4px 0 6px 0;
}

.panel>div {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: bottom;
}

.panel input {
  width: 120px;
}

.go-button {
  padding-top: 2px;
  box-sizing: border-box;
}

.cache-clearing {
  animation: spinning 1s linear;
}

[role=tabpanel] {
  padding: 0;
}

.clear-cache-button {
  min-width: 20px !important;
  zoom: 0.6;
  padding: 0;
  border: none;
  background: none;
}

.clear-cache-button img {
  width: 20px;
  height: 20px;
}

@keyframes spinning {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 900px) {
  .main-window {
    width: 100vw;
    background-size: inherit;
  }

  .panel input {
    width: 75px;
  }

  .panel button,
  .address-bar-container button {
    margin: 6px 0;
  }

  .address-bar-container {
    margin-bottom: 10px;
  }

  .address-bar {
    width: 210px;
    margin-right: 14px;
    font-size: .6rem;
    white-space: nowrap;
    overflow: auto;
  }

  .address-bar::-webkit-scrollbar {
    width: 10px;
    display: none;
  }

  .loading-container {
    margin-top: 20px;
  }

  .tabs {
    height: calc(100vh - 240px);
  }
}
</style>