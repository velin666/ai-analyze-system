<template>
  <div class="http404-container">
    <img src="/404_images/404_logo.png" alt="" class="logo" />
    <div class="http404">
      <p class="main-text">404！你来错地方了</p>
      <p class="sub-text">请确认当前页面是否存在，点击下方按钮回到主页</p>
      <a href="/" class="return-btn"></a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.http404-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-image: url('/404_images/404_dash.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background-repeat: no-repeat;
  .logo {
    width: 365px;
    height: 131px;
    position: absolute;
    z-index: 1;
    left: 7vw;
    top: 5vw;
  }
  .http404 {
    width: 716px;
    height: 384px;
    background: rgba(0, 0, 0, 0.32);
    border-radius: 77px;
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
    .main-text {
      margin-top: 53px;
      font-size: 50px;
      font-family: AlibabaPuHuiTi-Heavy, AlibabaPuHuiTi;
      font-weight: 800;
      color: #ffffff;
    }
    .sub-text {
      margin-top: 20px;
      width: 613px;
      font-size: 24px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
    }
    .return-btn {
      display: block;
      width: 305px;
      height: 122px;
      margin-top: 44px;
      background-image: url('/404_images/return-btn.png');
      background-size: 100%;
      &:active {
        opacity: 0.8;
        transform: translateY(10px);
      }
    }
  }
  @media screen and (max-width: 1280px) and (min-width: 720px) {
    .logo {
      transform: scale(0.5);
      transform-origin: left top;
    }
    .http404 {
      transform: scale(0.8);
    }
  }
  @media screen and (max-width: 720px) {
    .logo {
      display: none;
    }
    .http404 {
      transform: scale(0.5);
    }
  }
}
</style>
