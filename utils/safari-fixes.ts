// Safari检测和优化工具
export const isSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

// Safari版本检测
export const getSafariVersion = (): { version: number; isIOS: boolean; isMacOS: boolean } => {
  if (typeof navigator === 'undefined' || !isSafari()) {
    return { version: 0, isIOS: false, isMacOS: false }
  }
  
  const userAgent = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  const isMacOS = /Macintosh/.test(userAgent)
  
  // 提取Safari版本号
  const versionMatch = userAgent.match(/Version\/(\d+)\.?(\d+)?/)
  const version = versionMatch ? parseInt(versionMatch[1]) : 0
  
  return { version, isIOS, isMacOS }
}

// 检查是否为有问题的Safari版本
export const isProblematicSafariVersion = (): boolean => {
  const { version, isIOS, isMacOS } = getSafariVersion()
  
  // Safari 15-17 在滚动时有严重的渲染问题
  if (version >= 12 && version <= 17) return true
  
  // iOS Safari 通常比桌面版问题更多
  if (isIOS && version >= 14) return true
  
  return false
}

// 紧急降级方案 - 为有问题的Safari版本提供简化版本
export const applyEmergencyFallback = (): void => {
  if (typeof document === 'undefined') return
  
  if (isProblematicSafariVersion()) {
    document.documentElement.classList.add('safari-emergency-mode')
    
    const emergencyStyle = document.createElement('style')
    emergencyStyle.id = 'safari-emergency-fallback'
    emergencyStyle.textContent = `
      /* Safari紧急降级模式 - 完全静态化 */
      .safari-emergency-mode * {
        transition: none !important;
        animation: none !important;
        transform: none !important;
        will-change: auto !important;
        contain: none !important;
        box-shadow: none !important;
        filter: none !important;
      }
      
      .safari-emergency-mode *:hover {
        transform: none !important;
        box-shadow: none !important;
        opacity: 1 !important;
        filter: none !important;
      }
      
      /* 禁用所有可能的动画触发器 */
      .safari-emergency-mode .anime-list > div,
      .safari-emergency-mode .anime-card-optimized {
        transition: none !important;
        animation: none !important;
        transform: none !important;
      }
    `
    document.head.appendChild(emergencyStyle)
    
    // 显示降级模式提示（可选）
    console.warn('Safari滚动优化已启用：为保证流畅体验，部分动画效果已禁用')
  }
}

export const applySafariScrollFixes = (): void => {
  if (typeof document === 'undefined') return
  
  if (isSafari()) {
    document.documentElement.classList.add('safari-browser')
    
    // 首先尝试紧急降级
    applyEmergencyFallback()
    
    // 创建Safari专用样式 - 更激进的方案
    const existingStyle = document.getElementById('safari-scroll-fixes')
    if (!existingStyle) {
      const style = document.createElement('style')
      style.id = 'safari-scroll-fixes'
      style.textContent = `
        /* Safari滚动闪屏终极修复 */
        .safari-browser .anime-list > div {
          will-change: auto !important;
          contain: none !important;
          transform: translateZ(0) !important;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
        }
        
        .safari-browser .anime-list > div:hover {
          /* 移除所有hover效果，优先解决闪屏 */
          transform: translateZ(0) !important;
          transition: none !important;
        }
        
        .safari-browser body {
          transition: none !important;
          -webkit-overflow-scrolling: auto !important;
        }
        
        /* 完全禁用Safari中的所有动画 */
        .safari-browser * {
          transition: none !important;
          animation: none !important;
          will-change: auto !important;
          contain: none !important;
        }
      `
      document.head.appendChild(style)
    }
  }
}

// 激进滚动性能优化 - 专门针对Safari
export const optimizeScrollPerformance = (): void => {
  if (typeof window === 'undefined') return
  
  if (isSafari()) {
    let isScrolling = false
    let scrollTimer: number
    
    // 激进策略：滚动期间完全禁用所有动画
    const disableAllAnimations = () => {
      document.documentElement.classList.add('safari-scrolling')
      
      // 创建临时样式表完全禁用动画
      const existingDisableStyle = document.getElementById('safari-scroll-disable')
      if (!existingDisableStyle) {
        const disableStyle = document.createElement('style')
        disableStyle.id = 'safari-scroll-disable'
        disableStyle.textContent = `
          .safari-scrolling * {
            transition: none !important;
            animation: none !important;
            transform: translateZ(0) !important;
            will-change: auto !important;
            contain: none !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
          }
          
          .safari-scrolling *:hover {
            transform: translateZ(0) !important;
            box-shadow: none !important;
            opacity: 1 !important;
          }
        `
        document.head.appendChild(disableStyle)
      }
    }
    
    const enableAnimations = () => {
      document.documentElement.classList.remove('safari-scrolling')
      // 暂时不移除样式表，让CSS优先级处理
    }
    
    // 使用节流的滚动监听
    const onScroll = () => {
      if (!isScrolling) {
        disableAllAnimations()
        isScrolling = true
      }
      
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        enableAnimations()
        isScrolling = false
      }, 300) // 增加延迟，确保滚动完全结束
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
  } else {
    // 非Safari浏览器的轻量优化
    let ticking = false
    
    const updateScrollOptimizations = () => {
      document.documentElement.classList.add('scrolling')
      
      clearTimeout(window.scrollEndTimer)
      window.scrollEndTimer = setTimeout(() => {
        document.documentElement.classList.remove('scrolling')
      }, 150)
      
      ticking = false
    }
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollOptimizations)
        ticking = true
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
  }
}

// 扩展window类型
declare global {
  interface Window {
    scrollEndTimer: number
  }
}