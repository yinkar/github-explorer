<script setup>
import { ref, onMounted, computed } from 'vue'; 

const repoBox = ref(null);
const pathBox = ref(null);

const loading = ref(false);

const error = ref(false);

const repo = ref('yinkar/ilkkanmatik');
const path = ref('');
const address = ref('');

const visibleAddress = computed(() => {
  const repoNameArray = repo.value.split('/');

  if (repoNameArray.length < 2) return `[${repo.value}]`;
  if (path.value === '') return `[${repo.value}]/`;
  
  return `[${repo.value}] > ${path.value.replaceAll('/', ' > ')}`;
});

const list = ref([]);

function setRepoAndPath(e) {
  if (e.key === 'Enter') {
    setAddress();
  }
}

function setAddress() {
  repo.value = repoBox.value.value;
  path.value = pathBox.value.value;

  address.value = `${repo.value}/contents/${path.value}`;
  
  const repoNameArray = repo.value.split('/');

  if (repoNameArray.length === 0) return;

  // Get repos on user
  else if (repoNameArray.length === 1) {
    const username = repoNameArray.at(0);

    loading.value = true;
    (async () => {
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

        loading.value = false;
      }
      catch(e) {
        error.value = true;
      }
    })();

    return;
  }

  (async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${address.value}`);
      const data = await response.json();

      list.value.splice(0);
      list.value.push(...data.sort((a, b) => {
        return (b.type > a.type) ? -1 : (a.type > b.type) ? 1 : 0;
      }));

      loading.value = false;
    }
    catch(e) {
      error.value = true;
    }
  })();
}

function openRepo(repoPath) {
  repoBox.value.value = repoPath;
  setAddress();
}

function setPath(itemPath) {
  pathBox.value.value = itemPath;
  setAddress();
}

function openFile(url) {
   window.open(url, 'file', 'width=400,height=300');
}

function toUp() {
  const pathArray = path.value.split('/');

  if (pathArray.length === 1 && pathArray.at(0) === '') {
    const repoNameArray = repo.value.split('/');
    if (repoNameArray.length <= 1) return;

    repoBox.value.value = repoNameArray.at(0);
    setAddress();
    
    return;
  }

  pathArray.splice(-1);

  pathBox.value.value = pathArray.join('/');

  setAddress();
}

function closeAlert() {
  error.value = false;
  loading.value = false;
}

onMounted(() => {
  setAddress();
});
</script>

<template>
  <div class="main-window window active" style="max-width: 600px">
    <div class="title-bar">
      <div class="title-bar-text">Github Explorer</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="window-body has-space" style="min-height: 200px;">
      <div class="panel win7">
        <div class="field-row">
          <div class="input-group">
            <label for="repo">Repo: </label>
            <input type="text" ref="repoBox" @keypress="setRepoAndPath" v-model="repo" id="repo" required> 
          </div>

          <div class="input-group">
            <label for="path">Path: </label>
            <input type="text" ref="pathBox" @keypress="setRepoAndPath" v-model="path" id="path" required>
          </div>

          <div class="win7">
            <button @click="setAddress"><svg width="18px" height="18px" fill="#146ff2" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.007 2c-5.518 0-9.998 4.48-9.998 9.998 0 5.517 4.48 9.997 9.998 9.997s9.998-4.48 9.998-9.997c0-5.518-4.48-9.998-9.998-9.998zm1.523 6.21s1.502 1.505 3.255 3.259c.147.147.22.339.22.531s-.073.383-.22.53c-1.753 1.754-3.254 3.258-3.254 3.258-.145.145-.335.217-.526.217-.192-.001-.384-.074-.531-.221-.292-.293-.294-.766-.003-1.057l1.977-1.977h-6.693c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6.693l-1.978-1.979c-.29-.289-.287-.762.006-1.054.147-.147.339-.221.53-.222.19 0 .38.071.524.215z" fill-rule="nonzero"/></svg></button>
          </div>
        </div>

      </div>

      <div class="address-bar field-row">
        <input type="text" disabled :value="visibleAddress" style="width: 400px">

        <button @click="toUp">
          <img src="./assets/up.png" alt="Up" style="width: 20px; height: 20px;">
        </button>
      </div>

      <div class="loading-container">
        <div v-show="loading" class="loading marquee" role="progressbar"></div>
      </div>

      <div class="tabs">
        <div role="tabpanel">
          <ul class="files">
            <li v-for="item in list">
              
              <div class="repo" v-if="item.type === 'repo'" @click="openRepo(item.path)" :title="item.name">
                <img src="./assets/repo.png" :alt="item.name">
                <div class="file-name">
                  {{ item.name }}
                </div>
              </div>

              <div class="file" v-if="item.type === 'file'" @click="openFile(item.download_url)" :title="item.name">
                <img src="./assets/file.png" :alt="item.name">
                <div class="file-name">
                  {{ item.name }}
                </div>
              </div>
                
              <div class="dir" v-if="item.type === 'dir'" @click="setPath(item.path)" :title="item.name">
                <img src="./assets/folder.png" :alt="item.name">
                <div class="file-name">
                  {{ item.name }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>


  <div v-if="error" class="window alert" :class="{ active: error }" style="max-width: 300px; position: fixed; left: calc(50vw - 150px); top: 50vh;">
    <div class="title-bar">
      <div class="title-bar-text">Hata</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close" @click="closeAlert"></button>
      </div>
    </div>
    <div class="window-body has-space">
      <p>
        Bağlantı hatası
      </p>
      <section class="field-row" style="justify-content: flex-end">
        <button class="default" @click="closeAlert">Tamam</button>
        <button @click="closeAlert">İptal</button>
      </section>
    </div>
  </div>


</template>

<style scoped>
  .files {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    min-height: 100px;
    max-height: 300px;
    overflow: auto;
  }

  .files > li {
    margin: 10px 20px;
  }

  .files > li > div {
    flex-direction: column;
    display: flex;
    font-size: .8rem;
    justify-content: center;
    align-items: center;
  }

  .files .file-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 75px;
    text-align: center;
  }
  
  .files img {
    width: 25px;
    height: 25px;
  }

  .dir, .file, .repo {
    cursor: pointer;
  }

  .address-bar {
    margin: 10px 0 5px 0;
    height: 1rem;
    display: flex;
    justify-content: center;
  }

  .loading-container {
    height: 20px;
    padding: 4px 0 6px 0;
  }

  .panel > div {
    display: flex;
    justify-content: center;
  }
</style>
