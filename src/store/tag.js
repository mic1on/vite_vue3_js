import {defineStore} from 'pinia'

export const useTagStore = defineStore('tag', {
    state: () => ({
        tagsList: [],
        collapse: true
    }),
    getters: {
    },
    actions: {
        delTagsItem(data) {
            this.tagsList.splice(data.index, 1)
        },
        setTagsItem(data) {
            this.tagsList.push(data)
        },
        clearTags() {
            this.tagsList = []
        },
        closeTagsOther(data) {
            this.tagsList = data
        },
        closeCurrentTag(data) {
            for (let i = 0, len = this.tagsList.length; i < len; i++) {
                const item = this.tagsList[i];
                if (item.path === data.$route.fullPath) {
                    if (i < len - 1) {
                        data.router.push(this.tagsList[i + 1].path);
                    } else if (i > 0) {
                        data.router.push(this.tagsList[i - 1].path);
                    } else {
                        data.router.push("/");
                    }
                    this.tagsList.splice(i, 1);
                    break;
                }
            }
        },
        handleCollapse(data) {
            this.collapse = data
        }
    }
})
