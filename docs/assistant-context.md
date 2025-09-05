# Project Context

## Context
Praxis, or Life Alchemy (I have yet to decide the final name) is a tool designed to increase productivity. At first I just wanted to create a tool for myself that I could use locally on my machine but some of my friends want access to it (when it it finished) as well, so might as well turn it into a commercial tool. The core idea stemmed from "the Ivy Lee method" where you plan the six most important tasks that you need to get done the next day, ie you plan them out the evening before. This is done via the Daily Ledger page, in which you first check off whichever tasks you completed that day and then write an examination of how the day went - when you click "Next" you get forwarded to where you enter the tasks you want to complete the next day. 

The second "main" feature is the Daily Chat that I treat as a daily jorunal, in which I can write whatever thoughts or ideas I have - and it is active in the sense that you get a response from Praxis regarding whatever it is you have on your mind, thereby making it easier to probe deeper into understanding yourself, and to write more as compared to just starting at a blank page. This chat resets every day, yet the chat logs are stored in the backend. The current tasks are also visible from the daily chat and Praxis can help you complete them (in the beginning, only via chatting and brainstorming, but in the future I want it to actually complete tasks on my behalf based on the tasks I fill out).

The third most important feature of the app is the goal setting process, in which you will follow a set instructional list that helps you identify and write out your dream vision for your life and character, map out specific goals tied to specific timelines. 
All of the users data, their goals, their tasks, completion history, the daily chats, are stored and leveraged by Praxis to better help the user moving forward. This means that the Praxis AI can nudge you in the right direction if you're veering off, or help identify patterns that you otherwise woul've missed. This makes the entire app better and better the more you use it. 
In short, this app is a solution to the two main things you need in order to live a great life: goal setting, and productivity. With enough data, Praxis could uncover profound psychological and behavioral patterns, and reveal the hidden operating system of someone's psychology, predict when you're most likely to succeed or struggle with certain types of tasks, and generate personalized insights during weekly and monthly reviews that reveal deep truths about your progress. 

Some dream features I want to add:
- A knowledge bank. An Obsidian.md-like feature to capture, explore, and get AI-assisted insights on topics that spark your curiosity. For example if you have an interesting idea during the daily jounral about a specific topic, you can open a new document for it where you can store notes and write about that subject to learn more about it. Praxis can even recommend different topics the users would probably find interesting based on what it knows about them. You can publish these documents once you feel like you've accumilated enough notes about that topic, but only if it passes an AI-writing detection program, ensuring that all content published is original/man-made.  
- A built-in community that is only availbalbe to those who complete their daily tasks (a group of winnders who are actively working towards their goals)
- A "You" card in the Hero page, so that the user can talk to a future/current version of themselves. Beacuse you typically give others better advice than you give yourself.
- A "Synthesize" feature that generated weekly, monthly, yearly reviews based on all the data about the user
- A budgeting tab, where the user connects their bank via some platform like Tink and gets to see their daily spending, income, manage their budget and track/predict their networth. 
- A challenge feature where you can enroll in different month-long self improvement challenges OR create your own

## Product Pillars
- Clarity: Simple daily flow that reduces friction and cognitive load
- Reflection: Prompts and conversation that deepen self-awareness
- Accountability: Gentle links from actions to stated goals and values
- Continuity: Persistent history that surfaces patterns over days/weeks


## Features (current)
- Daily chat with Praxis (AI) using `system_prompts`
- Chat sessions persisted per-day in `chat_sessions`
- Initial tables for goals, tasks, plans, and user profile
- Basic UI for daily chat

## Data Model (high level)
- `system_prompts` — stores persona prompts (e.g., `praxis`, heroes), editable and versionable via rows
- `chat_sessions` — per-user, per-persona, per-day messages + `context_snapshot`
- `user_profiles` — user metadata synchronized from auth
- `daily_tasks`, `daily_plans`, `goals` — foundations for context and progress

## Current Focus
- Supabase project setup (migrations, RLS, indexes)
- Use env vars for Supabase and Anthropic keys
- Seed `system_prompts` (Praxis, then heroes)
- Ensure chat sessions persist and can be reviewed easily

## Constraints
- Keep UI minimal and consistent; avoid unnecessary new pages
- Respect privacy

## Decision Log
- YYYY-MM-DD — Store prompts in `system_prompts` to enable easy editing and adding personas
- YYYY-MM-DD — Persist chats per-day in `chat_sessions` to encourage daily reflection cadence

## Glossary
- Praxis: the primary daily AI companion
- Hero: a specialized persona with a distinct system prompt

