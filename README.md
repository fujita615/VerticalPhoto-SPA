# 縦長写真共有サービス VerticalPhoto-SPA ver.3
縦長写真に限定したアップロード・ダウンロードができるWEBサービスのフロントエンドです。

バックエンド：
[VerticalPhoto-API](https://github.com/fujita615/VerticalPhoto-API)
## ver.2からの変更点
 - Vue3 Options APIからComposition APIに書き換え
 - レビューコメント新規登録フォームに表示/非表示の切り替えボタンを追加
 - 写真詳細ページ・タグ絞り込みページのURLをパスパラメータからクエリパラメータで指定するように変更
 （本番環境でのブラウザリロードに対応するため）

## 背景
ポートフォリオとして制作したWEBサービスのサンプルです.

## URL
https://www.yf5160.com

## 機能
- 写真の一覧表示 詳細表示 タグ検索 
- ユーザー情報登録・更新・削除
- 写真の投稿（タグ付け）・削除・ダウンロード
- 他ユーザーの投稿写真へのいいね・コメント・ダウンロード
- レスポンシブデザイン

## 使用言語
- JavaScript(Vue3/__Composition API__)
- CSS(SASS/FLOCSS設計)

## 開発環境
### frontend
 Vite(server & Build Tools)

### ver.1.0からver.2.0への変更点
- [フロントエンドとバックエンドを分離して](https://github.com/fujita615/VerticalPhoto-API/tree/version-01/work/vertical/resources/js)別サーバーに配置