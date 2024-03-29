import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { formatLyaic } from "./utils";
import { getLyric } from "@/service/player";

export default function useLyaic(currentTime) {

  const store = useStore()
  const currentSong = computed(() => store.getters.currentSong)
  const playing = computed(() => store.state.playing)
  const currentLyaic = ref([])
  const currentLyaicNum = ref(0) // 当前播放行数
  const currentPlay = ref("") // 当前播放歌词
  const lyricScrollRef = ref(null) // 滚动组件
  const lyricRef = ref(null) // 歌词p标签
  const currentMTime = ref(0) // 点击播放哪一句歌词

  let timer = null // 监听器
  // 监听当前播放歌曲
  watch(currentSong, async (newSong) => {
    if (!newSong.id) return
    let { lrc } = await getLyric(newSong.id)
    currentLyaic.value = formatLyaic(lrc.lyric)
    // 重置
    currentLyaicNum.value = currentTime.value = 0
    if (!playing.value) return
    stopPlay()
    playLyric() // 播放当前歌词
  })
  // 监听当前索引
  watch(currentLyaicNum, (newNum) => {
    // 当前索引
    currentLyaicNum.value = newNum
    run(newNum)
  })

  function run(newNum) {
    const lyricScrollRefValue = lyricScrollRef.value
    const lyricRefValue = lyricRef.value

    // 从第七句歌词开始滚动
    if (newNum > 5) {
      const targetEl = lyricRefValue.children[newNum - 5]
      // 滚动歌词
      lyricScrollRefValue.scroll.scrollToElement(targetEl, 1000);
    } else {
      // 取消滚动
      lyricScrollRefValue.scroll.scrollToElement(0, 0, 1000)
    }
  }
  function playLyric() {

    let currentLyaicValue = currentLyaic.value
    if (currentLyaicValue) {
      // 当前索引
      currentIndex()
      // 开启歌词滚动
      startRun()
    }
  }
  // 关闭定时器
  function stopPlay(params) {
    clearTimeout(timer)
  }
  // 歌词滚动
  function startRun() {

    let currentLyaicValue = currentLyaic.value
    if (!currentLyaicValue.length) return
    let index = currentLyaicNum.value

    if (index === currentLyaicValue.length - 1) return
    // 差值：上一句歌词和下一句歌词时间的差值（非最后一句歌词）
    let differenceValue = currentLyaicValue[index + 1].time - currentTime.value
    timer = setTimeout(() => {
      currentLyaicNum.value = Math.min(++index, currentLyaicValue.length - 1)
      currentPlay.value = currentLyaicValue[index].currentSong
      startRun()
    }, differenceValue * 1000)
  }
  // 获取当前播放歌词和当前行数
  function currentIndex() {
    let currentTimeValue = currentTime.value
    let currentLyaicValue = currentLyaic.value
    if (!currentLyaicValue.length) return
    let index = 0
    for (let i = 0; i < currentLyaicValue.length; i++) {
      // 当前歌词为 大于等于当前歌词的播放时间，小于下一句歌词的开始播放的时间
      if (currentTimeValue >= currentLyaicValue[i].time && currentLyaicValue[i + 1] ? currentTimeValue < currentLyaicValue[i + 1].time : true
      ) {
        index = i
        break;
      }
    }
    currentLyaicNum.value = index
    currentPlay.value = currentLyaicValue[index].currentSong
  }
  return {
    currentLyaic,
    currentLyaicNum,
    lyricScrollRef,
    lyricRef,
    currentMTime,
    playLyric,
    stopPlay,
    currentPlay
  }
}