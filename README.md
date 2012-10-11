# DNSPod 文档中心 β1
这里是 DNSPod 文档中心，方便共享文档，管理文档。

Demo：https://dnspod-docs.meteor.com

## Features

- 实时：所有修改都即时反映在所有人的浏览器上，前所未有的帅呀，Awesome!
- 纯文本编辑：自从用了 Markdown 编辑文档，腰也不酸了，手也不疼了
- 实时预览：双栏编辑，实时预览，爽阿～创意来自 [Mou](http://mouapp.com)
- 分类：在左侧可以自由建立分类。As much as you wish
- 多标签：给文档加注任意标签，可以按标签索引同类文档，快如闪电。创意来自 [nvAlt](http://brettterpstra.com/project/nvalt/)
- 全文搜索：搜索一切数据。。分类、标签、文档内容

## Tech Specs

- [Meteor](http://www.meteor.com)：非常新颖的一站式Web框架，Meteor-BBS 主要 （[讨论1](http://www.v2ex.com/t/33961)，[讨论2](http://www.v2ex.com/t/48084)）
- [Backbone.js](http://documentcloud.github.com/backbone/)：前端 MVC 框架，便于前端实现复杂的js单页应用（类似Gmail）
- [CoffeeScript](http://coffeescript.org)：一个语言，可以编译为js，语法简洁，隐藏了js中的难以驾驭的部分


## How to start

1. ~~安装 Meteor（目前基于 0.3.4，因为 Meteor 变化很快，新版本不一定支持）~~

1. 安装 meteorite（使用了 atmosphere 的 package

   ~~~
   npm install -g meteorite
   ~~~

1. git clone

   ~~~
   $ git clone https://github.com/chuangbo/dnspod-docs.git
   $ cd dnspod-docs
   ~~~

3. run

   ~~~
   $ # meteor
   $ mrt
   ~~~


## Contribute

项目目前是 DNSPod 团队内部共享文档正在使用的，虽然代码质量不高，但是会一直维护，欢迎团队内部或外部的同学 Fork。