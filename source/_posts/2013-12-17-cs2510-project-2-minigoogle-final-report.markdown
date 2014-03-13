---
layout: post
title: "CS2510: Project 2 - MiniGoogle Final Report"
date: 2013-12-17 16:42
comments: true
categories: [mapreduce, socket, c, os, pitt, desperate, project]
---

CS2510: Project 2 - MiniGoogle Final Report

##### Guanxiong Ding (gud7)

12/17/2013

## General Workflow

#### Indexing workflow
* client send the documents to minigoogle server
* mingoogle server dispatch socket connections to worker by fork a process
* worker lookup mappers and reducers
* worker split the file and send to ma ppers
* each mapper count word for its split
* mapper partition the word count result and send to reducer
* reducer aggregate the result and append to master index files

#### Querying workflow
* client send keywords to minigoogle server
* mingoogle server dispatch socket connections to worker by fork a process
* worker lookup mappers and reducers
* worker send each keyword to each mapper
* each mapper get a set of document - occurrence pairs by the keyword
* mapper send result set to reducer
* reducer gather all sets from mappers and calculate the total occurrence
* reducer sort the document by total occurrence and send back to client

## Client

It is a program on local machine. It can be runned by user on command line along with parameters. client will first lookup the naming server to find the address of mini-google, then request for a socket connection and then send index/query request to it with connection and then waiting for response.

### Mini-google

First it will create a socket and binding with the address and port number, then listen() in a infinite loop. When receiving a request from client, it create a new process regarding to request type (index/query) to handle the request. After that, server will keeping listening for other requests. 

### Worker

Worker is the critical part of the whole work. It holds the connection with client and send result back to client if all mappers and reducers have done their work. It will split the file by the number of available mapper it got from name server. After file splitted, it will send each split to each mapper by a set of parameters

* split file name 
* document name
* number of mappers // to let reducer know when to start reducing
* address and ports of all reducers

and then waiting for their response by holding connection on multi-threads. If all mappers response work done, it will send message to client and close the connection.

### Mapper helper

Before working, it will register on name server when start running, with it address, port and type, which is "mapper".

Mapper first do the word counting and combining on it splits by shell script using tr, sed, awk, uniq, sort. and then do partition on the map result, by the number of reducers. It do partition not by lines, but by alphabetic. Meaning if number of reducers is 2, result will be partition to two files, one with terms from [a-m], one with terms from [n-z], which refers to the step of shuffle. Then sent each partition to each reducer and waiting for their response by holding connection on multi-threads. If all reducers response work done, it will send message to worker and close the connection.

### Reducer helper

Before working, it will register on name server when start running, with it address, port and type, which is "reducer".

Reducer first get the number of mappers. By this number, it will know how many mapper it have to wait. After it received all data from mapper, it will start to aggregate the mapper by shell script with awk. Then it will start 5 thread to merge result to master index. When all thread done their job. Reducer will send message back to mapper that its work done.

### Name Server

Naming server establish sockets and keep waiting for connection. It support two type of request,register and request. Register will store address, port, server type. Lookup will will send back a set of address, port and server type by server type and number. For example, get 5 mappers, or get 3 reducers.

### Master index

In this project, name index is separated alphabetically in 26 files for each letter. The advantage is that they could be better paralleled in indexing and querying with less concern on blocking issues.

