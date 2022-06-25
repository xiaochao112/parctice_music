import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'
import { onMounted, ref } from "vue"

BScroll.use(Slide)

export function useSlider() {
  const slider = ref(null)
  const rootRef = ref(null)
  const currentPageIndex  = ref(0)
  onMounted(() => {
    slider.value = new BScroll(rootRef.value, {
      slide: true, // 插件激活
      click: true, // 允许点击
      scrollX: true, // 横向滚动
      scrollY: false, // 纵向滚动
      momentum: false,
      bounce: false, //回弹动画
      probeType: 2,
    })
    slider.value.on("slidePageChanged", (page) => {
      currentPageIndex.value = page.pageX
    })
  })
  return {
    rootRef,
    currentPageIndex
  }
}