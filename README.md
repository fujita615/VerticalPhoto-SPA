# 縦長写真共有サービス VerticalPhoto-SPA ver.4
縦長写真に限定したアップロード・ダウンロードができるWEBサービスのフロントエンドです。

バックエンド：
[VerticalPhoto-API](https://github.com/fujita615/VerticalPhoto-API)
## ver.3からの変更点
 - JavaScriptからTypeScriptに書き換え
 - 状態管理ライブラリpiniaを導入

## 背景
ポートフォリオとして制作したWEBサービスのサンプルです.

## URL
https://www.yf5160.com

## 機能
- 写真の一覧表示 詳細表示 タグ検索 
- ユーザー情報登録・更新・削除
- 写真の投稿（タグ付け）・削除・ダウンロード
- 他ユーザーの投稿写真へのいいね・コメント・ダウンロード
- マイページ機能（ログイン機能）
- 問い合わせフォーム（自動メール返信）
- レスポンシブデザイン

## 使用言語
- __TypeScript__(Vue3/Composition API)
- CSS(SASS/FLOCSS設計)

## 開発環境
### frontend
 Vite(server & Build Tools)

### ver.2.0からver.3.0への変更点
- Vue3 Options APIからComposition APIに書き換え
### ver.1.0からver.2.0への変更点
- [フロントエンドとバックエンドを分離して](https://github.com/fujita615/VerticalPhoto-API/tree/version-01/work/vertical/resources/js)別サーバーに配置