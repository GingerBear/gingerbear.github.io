---
layout: post
title: "A phone number matching regular expression"
date: 2014-01-10 16:11
comments: true
categories: regex, learn
---
I used to void learning regular expression, because they looks too dry to digest. And in most case when I wanna use them, I can find existing ones on the web. But there are always a shadow in my mind that it is important. The shadow forms from when I found a lot of JavaScript books spending a whole chapter introducing Regular Expression. Weeks ago when I was reading Jeff Atwood's *Effective Programming: More Than Writing Code*, I read a chapter talking about phone screen. It point out five main part in phone screen.

- Coding
- OO Programming
- Scripting and Regular Expression
- Data Structure
- Bits and Bytes

The **Regular Expression** hits me, and make me starting learn it. After reading the recommanded [MDN Article](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions) and a [video](https://www.youtube.com/watch?v=EkluES9Rvak) presented by Lea Verou, I start to do the sample task on Jeff's book about Regular Expression.

### A phone number match

Two kinds of phone should be matched: (123)-321-4321 and 123-321-4321.

First, the method I use is 

	Regex.test(String)
it will return ture if match, false if not.

Let's do the first case. a "(" at the begining, so /\(/. Then three number and a "}", so /\(\d{3}\)/. Then just "-" and three and four numbers, so 

	/\(\d{3}\)-\d{3}-\d{4}/.

In the second case, there is not "(". So "(" should occure once or not, so add a "?". 

	/\(?\d{3}\)?-\d{3}-\d{4}/.

However there is a false positive for something like 123)-321-4321. The solution is make it occur for both "(" and ")", OR neither of them. so 

	/((\d{3})|(\(\d{3}\)))-\d{3}-\d{4}/

Everyone told me how powerful Regular Expressiuon is, so I guess there are much more for me to discover. 