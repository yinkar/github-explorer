<script setup>
defineProps({
  list: Array,
  openRepo: Function,
  openFile: Function,
  setPath: Function,
});
</script>

<template>
  <ul class="files">
    <li v-for="item in list">
      
      <div class="repo" v-if="item.type === 'repo'" @click="openRepo(item.path)" :title="item.name">
        <img src="../assets/repo.png" :alt="item.name">
        <div class="file-name">
            {{ item.name }}
        </div>
      </div>

      <div class="file" v-if="item.type === 'file' && [ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'jfif', 'webp' ].includes(item.name.split('.').filter(e => e).at(-1))" @click="openFile(item.download_url, item.name)" :title="item.name">
        <img :src="item.download_url" :alt="item.name">
        <div class="file-name">
            {{ item.name }}
        </div>
      </div>

      <div class="file" v-else-if="item.type === 'file'" @click="openFile(item.download_url, item.name)" :title="item.name">
        <img src="../assets/file.png" :alt="item.name">
        <div class="file-name">
            {{ item.name }}
        </div>
      </div>
      
      <div class="dir" v-if="item.type === 'dir'" @click="setPath(item.path)" :title="item.name">
        <img src="../assets/folder.png" :alt="item.name">
        <div class="file-name">
            {{ item.name }}
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.files {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  overflow: auto;
  width: 100%;
  height: 250px;
  align-content: flex-start;
}

.files > li {
  margin: 20px 10px;
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

@media screen and (max-width: 900px) {
  .files {
    width: auto;
    height: calc(100vh - 190px);
  }
}
</style>