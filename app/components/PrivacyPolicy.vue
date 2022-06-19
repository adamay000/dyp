<script lang="ts" setup>
// do nothing
</script>

<template>
  <section class="c-privacy-policy">
    <h2 class="title">Privacy Policy</h2>
    <article class="main privacy-item">
      <h3 class="title">Google Analyticsについて</h3>
      <p>
        本ページではユーザの訪問状況や閲覧した情報を把握するためにGoogle社のGoogle Analyticsを利用しています。<br />
        Google
        Analyticsではデータ収集のためにCookieを使用しています。収集されるデータにはモバイルデバイスの識別情報などが含まれていますが、個人を特定するものではありません。<br />
        ユーザはCookieを無効にすることで、これらの機能を拒否することができます。<br />
        データの収集・処理に関する仕組みについては、次のページをご覧ください。<br />
        <a
          href="https://www.google.com/intl/ja/policies/privacy/partners/"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          https://www.google.com/intl/ja/policies/privacy/partners/
        </a>
      </p>
    </article>
  </section>
</template>

<style lang="scss" scoped>
.c-privacy-policy {
  margin-top: 80px;
  letter-spacing: 0;
  color: $color-text-tertiary;
  @media ($sp) {
    margin-top: 40px;
  }
  & > .title {
    font-size: 13px;
    font-weight: bold;
  }
  & > .main {
    margin-top: 8px;
  }
}
.privacy-item {
  line-height: 1.2;
  font-size: 12px;
  & > .title {
    margin-bottom: 3px;
  }
}
</style>
