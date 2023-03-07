<script setup>
import { ref, onMounted, computed } from 'vue';
import Files from './components/Files.vue';
import Alert from './components/Alert.vue';
import Preview from './components/Preview.vue';

const repoBox = ref(null);
const pathBox = ref(null);

const loading = ref(false);

const error = ref(false);
const preview = ref(false);

const repo = ref('yinkar/ilkkanmatik');
const path = ref('');
const address = ref('');
const content = ref('');

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

  const repoNameArray = repo.value.split('/');

  if (repoNameArray.length > 0) {
    address.value = `${repo.value}/contents/${path.value}`;
  }
  else {
    address.value = `${repo.value}`;
  }

  window.location.hash = `${repo.value}/${path.value}`.replace(/\/$/, '');

  const getCached = () => {
    const cachedData = window.sessionStorage.getItem(address.value);

    if (cachedData) {
      list.value.splice(0);
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
    
    (async () => {
      if (getCached()) return;

      try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const data = await response.json();

        list.value.splice(0);
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
      }
      catch(e) {
        error.value = true;
      }
    })();
  }

  (async () => {
    if (getCached()) return;
    
    try {
      const response = await fetch(`https://api.github.com/repos/${address.value}`);
      const data = await response.json();

      list.value.splice(0);
      list.value.push(...data.sort((a, b) => {
        return (b.type > a.type) ? -1 : (a.type > b.type) ? 1 : 0;
      }));

      window.sessionStorage.setItem(address.value, JSON.stringify(list.value));

      loading.value = false;
    }
    catch(e) {
      error.value = true;
    }
  })();

}

function openRepo(repoPath) {
  repoBox.value.value = repoPath;
  goAddress();
}

function setPath(itemPath) {
  pathBox.value.value = itemPath;
  goAddress();
}

function openFile(url) {
  fetch(url)
    .then(r => r.text())
    .then(d => {
      preview.value = true;

      if ([ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'jfif', 'webp' ].includes(url.split('.').filter(e => e).at(-1))) {
        content.value = `
          <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <img src="${url}">  
          </div>
        `;
        return;
      }

      content.value = `<pre style="font-family: monospace;">${d.replace(/[\u00A0-\u9999<>\&]/gim, e => `&#${e.charCodeAt(0)};`)}</pre>`;
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

onMounted(() => {
  if (window.location.hash !== '') {
    const hashArray = window.location.hash.substring(1).split('/');

    if (hashArray.length < 1) return;

    pathBox.value.value = hashArray.splice(2).join('/');
    repoBox.value.value = hashArray.join('/');
  }

  goAddress();
});

function closePreview() {
  preview.value = false;
  content.value = '';
}
</script>

<template>
  <div class="main-window window active glass">
    <div class="title-bar">
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
            <input type="text" ref="repoBox" @input="pathBox.value = ''" @keypress="setRepoAndPath" v-model="repo" id="repo" required> 
          </div>

          <div class="input-group">
            <label for="path">Path: </label>
            <input type="text" ref="pathBox" @keypress="setRepoAndPath" v-model="path" id="path" required>
          </div>

          <div class="win7">
            <button @click="goAddress" :disabled="loading" class="go-button">
              <svg width="18px" height="18px" fill="#146ff2" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.007 2c-5.518 0-9.998 4.48-9.998 9.998 0 5.517 4.48 9.997 9.998 9.997s9.998-4.48 9.998-9.997c0-5.518-4.48-9.998-9.998-9.998zm1.523 6.21s1.502 1.505 3.255 3.259c.147.147.22.339.22.531s-.073.383-.22.53c-1.753 1.754-3.254 3.258-3.254 3.258-.145.145-.335.217-.526.217-.192-.001-.384-.074-.531-.221-.292-.293-.294-.766-.003-1.057l1.977-1.977h-6.693c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6.693l-1.978-1.979c-.29-.289-.287-.762.006-1.054.147-.147.339-.221.53-.222.19 0 .38.071.524.215z" fill-rule="nonzero"/></svg>
            </button>
          </div>
        </div>

      </div>

      <div class="address-bar field-row">
        <input type="text" :title="visibleAddress" :value="visibleAddress" disabled>

        <button @click="toUp" :disabled="loading">
          <img src="./assets/up.png" alt="Up" style="width: 20px; height: 20px;">
        </button>
      </div>

      <div class="loading-container">
        <div v-show="loading" class="loading marquee" role="progressbar"></div>
      </div>

      <div class="tabs">
        <div role="tabpanel">
          <Files :list="list" :open-repo="openRepo" :open-file="openFile" :set-path="setPath" />
        </div>
      </div>
    </div>
  </div>

  <Preview v-if="preview" :preview="preview" :close-preview="closePreview" :content="content" />

  <Alert v-if="error" :error="error" :close-alert="closeAlert" />

</template>

<style scoped>
.address-bar {
  margin: 10px 0 5px 0;
  height: 1rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.address-bar input {
  width: 312px;
}

.loading-container {
  height: 20px;
  padding: 4px 0 6px 0;
}

.panel > div {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: bottom;
}

.panel input {
  width: 120px;
}

@media screen and (max-width: 900px) {
  .main-window {
    width: 100vw;
  }

  .panel input {
    width: 75px;
  }

  .panel button, .address-bar button {
    margin: 6px 0;
  }

  .address-bar {
    margin-bottom: 10px;
  }

  .address-bar input {
    width: 210px;
    margin-right: 14px;
  }

  .loading-container {
    margin-top: 20px;
  }

  .tabs {
    height: calc(100vh - 160px);
  }

  .files {
    height: calc(100vh - 190px);
  }
}
</style>