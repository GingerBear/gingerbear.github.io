---
layout: post
title: "A User Level Light-weight Thread Scheduling Implementation "
date: 2013-11-01 14:55
comments: true
categories: os, project, code
---

In last three days, I was trying to the operating system course project. It is a user level light-weight thread scheduler, with semaphores dealing with concurrency problem. Frankly I never did and multi-thread programming before, not to mention a write a multi-thread scheduler in C. And of course, I didn't do well with the operating system course. I will talk about the course at the end of this post. I almost forgot this homework until I found it just left three for the due. So what I do is not from nothing, but from my [cadmuxe](https://github.com/cadmuxe)'s code. Here I am gonna explain how it works. 

## Description and Requirement

The whole requirement is [here](https://drive.google.com/file/d/1oWoWm2MAQf7uEw0U8gwXLUK0ufQHAlexupOlO0o6QZTG3Z67kM7GrRFsV0a7LK1mHObatCizd_Y4_8RD/edit?usp=sharing). In short, the scheduler have 
	lwt_init(int quantum)
to set up the main thread, the global thread, the signal hander and thread running intervel with the a period of time as parameter (quantum).
	lwt_create(char *name, void *argv, fun_type fn)
to create a thread with name, argument pointer and function pointer. and run it immediatly. return thread indentifier.
	lwt_sleep(int seconds)
to put current thread into sleep for seconds.
	thrd_wait(lwt *t)
to put current thread into wait until the input thread (child thread) exit.
	smphr_create(int size)
to create a semaphore with a input size, and init a thread queue for waiting list.
	P(smphr *s)
to acquire semaphore if avaible, if not, put current thread into queue
	V(smphr *s)
to release semaphore, and dequeue the front thread in queue

## How to achieve multi-thread

The idea is pretty similar with multi-processes running on a single processor. Threads are switched in a fast speed with a process, making it like they are served simultaneously. But how to make the switch? Use *alarm signal* to interrupt running thread, *setjmp* to save its running environment and *longjmp* to restore to its that environment. Here is the code :

	lwt_init() 
	{
		/* ... */

		signal(SIGALRM, alarm_handler);
		ualarm(lwt_quantum, 0);

		/* ... */
	}

	void alarm_handler () 
	{
		/* ... */

		if (setjmp(sys_t.curr->env) == 0) {	// interrupted, save current thread's runing environment. if get here from longjmp(), setjmp will return no-zero
			do {
				sys_t.curr = sys_t.curr->next; // set next thread as current thread

				/* ... check state of current thread here */

			} while (sys_t.curr->state != lwt_READY);

			ualarm(sys_t.interval + sys_t.curr->prior, 0);
			longjmp(sys_t.curr->env, 1);	// after switch, continue running environment where it was saved
		}

		/* ... */
	}

There is a serious problem here. Thread are created on main thread (actually process), so when they run, a stack will be allocated on the top of main stack. The stack will be remove if the thread run is over (returned). There is no problem if thread run one by one. But in this case, they are running simultaneously (not precisely simultaneous, but running without end of others). The result is that all these threads are using a same stack. We know that when we perform of a setjmp, env save the stack pointer of the thread. So it comes to the situation that switching will make thread go back to its stack pointer, but the content of that stack will not its content. Stack is all messed.

A way to solve this is to give each thread its own stack when they created. This is achieve by a statement of assembly language. Code is there:

	#ifdef _X86
	__asm__("mov %0, %%esp;": :"r"(sys_t.curr->stack + lwt_STACK_SIZE) );
	#else
	__asm__("mov %0, %%rsp;": :"r"(sys_t.curr->stack + lwt_STACK_SIZE) );
	#endif

I don't know jack about assembly language. But I was told that it move the stack pointer to a new stack.

## How to implement Semaphore

Semaphore actually is quite sample (the reason I say this, because I thought it was hard). It is like a gate keeper having a list of available rooms. It will tell the visitor if any room available. If yes, gate keeper will allow the visitor to use the room and reduce the number of available rooms. If no, put the visiter on the waiting list. 

If the visitor has done with the room, gate keeper will make that room available again, and give it to the first visitor on the waiting list, and sure remove him from waiting list.

P() is for thread to achieve the first part (check and gain semaphore), V() is for the second part (release semaphore and give to to front waiting list). Here is the code: 

	typedef struct smphr_t {
	    int 	smphr_size;
	    Queue 	queue;				// queue store thread waiting for semophore
	} smphr;
	 
	smphr * smphr_create(int smphr_size){
	    smphr *s;
	    s = malloc(sizeof(smphr));
	    s->smphr_size = smphr_size;
	    s->queue = CreateQueue();					// use a queue to store waiting list
	    return s;
	}

	void P(smphr *s){
	    int left = ualarm(0, 0);					// disable the context switch, by clear the alarm
	    if(s->smphr_size > 0){						
	        s->smphr_size -= 1;						// semaphore offered
	        ualarm(left, 0);						// restore context switch
	    } else {									// no more semaphore, blocked
	        s->smphr_size -= 1;						// TRICK! semaphore still need to be reduced one, in order to avoid fullCount getting too large. 
	        sys_t.curr->state = sem_WAIT;
	        Enqueue(sys_t.curr, s->queue);			// put into queue
	        raise(SIGALRM);
	    }
	}

	void V(smphr *s){
	    int left = ualarm(0, 0);
	    s->smphr_size += 1;							// release semaphore
	    if (!IsEmpty(s->queue)) {					
	    	Front(s->queue)->state = lwt_READY;		// dequeue front and set to READY, if not empty
	    	Dequeue(s->queue);
	    }
	    ualarm(left, 0);
	}

## Test with Producer-Consumer Problem

The LWT can be tested by a classical Producer-Consumer problem. Producer produce item, Consumer consume item produced. If item buffer is full, producer should wait (producer trying to produce should be put on the waiting list) until item is consumed and buffer is not full. Consumer, similarly, should wait if item buffer is empty (put on waiting list), until item is produced and buffer is not empty.

So we need a fullCount Semaphore (max size of buffer) to decide if full, a emptyCount Semaphore (max size of buffer) to decide if empty and a useLock to only let one producer/consumer access to buffer at one time. Here is the code:

	void producer(){
	    srand(time(NULL));  // Initializes random number generator
	    int item = 0;
	    while(1){        
	        item = rand();
	        P(emptyCount);
	        P(useQueue);
	        if (current < N) {
	            buffer[current++] = item;
	        }
	        V(useQueue);
	        V(fullCount);
	        printf("Producer: %s\tproduce: %d\te: %d\tf: %d\tSize:%d\n"
	            , get_curr_name()
	            , item
	            , smphr_get_size(emptyCount)
	            , smphr_get_size(fullCount)
	            , current);
	    }
	}

	void consumer(){
	    int item = 0;
	    int i = 0;
	    while(i < 30){ 
	        P(fullCount);
	        P(useQueue);
	        if (current > 0) {
	            item = buffer[--current];
	        }
	        V(useQueue);
	        V(emptyCount);
	        printf("Consumer: %s\tconsume: %d\te: %d\tf: %d\tSize:%d\n"
	            , get_curr_name()
	            , item
	            , smphr_get_size(emptyCount)
	            , smphr_get_size(fullCount)
	            , current);
	        i++;
	    }
	}

	int main(int argc, char *argv[]){
	    int i,j;
	    lwt *t;
	    emptyCount  = smphr_create(N);
	    fullCount   = smphr_create(0);
	    useQueue    = smphr_create(1);

	    lwt_init(QUANTUM);

	    lwt_create("p1", 0, NULL, producer);  
	    lwt_create("p2", 0, NULL, producer);  
	    lwt_create("p3", 0, NULL, producer);  
	    lwt_create("p4", 0, NULL, producer);  
	    lwt_create("c1", 0, NULL, consumer);     
	    t = lwt_create("c2", 0, NULL, consumer);     

	    thrd_wait(t);
	    printf("Two Consumers consume 30 items!\n");
	    printf("Done!\n");
	}

The full code is on [github](https://github.com/GingerBear/LWT). Thanks to [cadmuxe](https://github.com/cadmuxe) and [liyangbin](https://github.com/liyangbin) for the help.