# wechat-export

Export WeChat chat histories to HTML files.

## Preview

This script generates a HTML file for each contact's chat history.

<img src="./assets/preview.jpeg" width="320" />

Currently it supports:

* Text
* Voice
* Picture
* Video
* System message

TODO:

- [ ] Emoji
- [ ] Link

## How to Use

Tested on macOS 11.5.2 and iOS 14.8, but should work on any recent versions.

1. Back up iPhone with your Mac.

    <img src="./assets/backup.png" width="500" />

2. Use [iExplore](https://macroplant.com/iexplorer) to export "Documents" to the local system.

    <img src="./assets/iexplore.png" width="500" />

3. Clone the code.
4. Compile the [audio decoder](https://github.com/kn007/silk-v3-decoder): `cd silk/silk && make && cd ../../`
5. `npm install`
6. `node index.js path_to/Documents/{uid} output_dir` (`path_to/Documents` is what we got from the second step, and `uid` looks like `g3c3814a370neh4dr69uf9f889f6ea7a`).

## Articles

* [iOS 微信的本地存储结构简析](https://zhuanlan.zhihu.com/p/22474033)

## Related Projects

* [WeChatExporter](https://github.com/tsycnh/WeChatExporter)
* [WechatExport-iOS](https://github.com/stomakun/WechatExport-iOS)

## Credits

Silk decoder is developed by [Karl Chen](https://github.com/kn007/silk-v3-decoder).
