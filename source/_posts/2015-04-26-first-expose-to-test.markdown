---
layout: post
title: "first expose to test"
date: 2015-04-26 16:50
comments: true
categories: [tech, test, javascript, node]
---

I have seen quite a lot of talking about test, and tried a little RSpec when learning Ruby on Rails years ago. But I don't really get myself dig into the testing world. Today is Sunday, it's a sudden that come to my mind that maybe I should spend some time figure it out. 

It's a sad fact that the company I am working never encourage writing test for project. It relays a lot on human QA. Well that's not bad in some sense. But apparently we can be more efficient and get less bug if we adopt automated test. There seems to be architecture change in term of development. I found it a good chance to add test to the new architecture. 

I just spend an afternoon make the test working for the [nba-daily project](https://github.com/GingerBear/nba-daily) that I have worked months ago. It has similar idea behind the company project, which proxying site to a better UI. In the mind, the test should be to pretty simple, namely, going to a page, checking that page contains what we need, going to another page, checking again.

Check element is pretty common in testing. Most test framework and assert library should already taken then cared. The only thing is to requesting page. Obviously we cannot use node's plane http request module because if the real project, the request has to maintain the cookie and session. Normally cookie and session is handled by browser, so my first head to find those browser testing tools. It turns out that there is thing called Selenium, which can opens up local or remote browser, and use the browser to make the request. It can use different web driver to drive different browser. I tried the `chai-webdriver` and chrome driver, it works, but it won't work on the Travis CI, which doesn't have a browser GUI. To make Travis work, we need to use remote browser on virtual machine. I know that I have pay to use that. 

Then it come up another solution, PhantomJS. It call itself `headless WebKit`. It's hard to understand what is headless. But to my understanding, it's browser without GUI, and can be fully controlled by JavaScript (comparing to real browsers that expose limited API). And fortunately, Travis CI have PhantomJS pre installed on their virtual machine. So to make the whole thing work, I just need to plugin phantomjs into my test.

At the beginning, it's confused me when I found phantomjs is not coded with JavaScript (but C++), nor it's a node module. I was mistakenly thought that it's node implementation of browser, it can be npm installed. It turns out that it doesn't have much to do with nodejs. They are completely two different environment. I was trying to try the simple code on the doc, but it just not works.

After digging a while, I found that to make phantomjs working in node, I need to instal a bridge to make communicate, which is node module. With the bridge, I can create a phantomjs instance, then create a page instance, then open a url. After I get the response, I evaluate a piece of JavaScript function to get what we want on the page. I just typing something in the browser console and expecting something coming bac. Another interesting thing is, we I run the test, I can see the server response in my node terminal, which also include those assets request. This also proved that phantomjs is a `real` browser. At this point, I get everything I need.

I pick up the most used (or most famous) test tool, mocha and chai to construct the test case. Soon I found that the assert need to be async. It need to assert after the request is done. Mocha provide a very nice way to achieve, simply call the done() function after asynchronously  assert. A very nice thing about phantomjs here is that, one of my request is based on the ajax call on the page. As long as I set a few seconds timeout to wait for the request is done, test is totally working!

When I try to intentionally fail the test, gotcha occur. When I fail the first test, the rest tests all get timeouted error. It wired, since if one failed, the test should show that they should show, either success or fail, why it's a timeout error? It turns out that, when a async test failed, the assert will throw an error. So the following done() function will never run, which make the rest tests timeout. The solution is to wrap a try catch to assert and done, and call done again in the catch with e as params. So when assert failed, done will still get called. 

After all test working locally, the deployment just work out of the box. Travis will automatically run `npm test` if there is one in the package.json. So I send a pr, all build and test start running automatically. After a while, pass all green. yay!

<img src="{{ root_url }}/images/travis-pass.png" />

