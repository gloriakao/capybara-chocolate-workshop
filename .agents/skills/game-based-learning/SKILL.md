---
name: game-based-learning
description: 為這個專案規劃、製作或改善數位遊戲式學習作品，把可觀察的學習成果轉成核心玩法、回饋與評量。一般非教育型遊戲不使用。
---

# 遊戲式學習設計

Use this skill when the user wants to plan, build, revise, or evaluate an educational game or learning mechanic in this project. Base design decisions on the supplied learning goals and constraints. The goal is for players to use knowledge through meaningful actions and decisions, not merely to encounter educational text while playing.

## Work within this project

- Read the applicable `AGENTS.md`, inspect the repository, and identify its engine, scenes, state model, UI conventions, assets, and available commands before changing code. The project name suggests Phaser, but confirm the actual stack instead of assuming it.
- Keep changes within the existing architecture and the user's requested scope. Do not replace the engine or add dependencies unless the task requires it.
- If the user asks to build or change the game, implement the requested work in the project; do not stop at a design document. Match the amount of planning and documentation to the size of the request.

## Design from learning to play

1. **Define an observable learning outcome.** State what the learner should be able to do, under what conditions, and what evidence would show it. Prefer an action such as compare, explain, predict, classify, or choose with reasons over a vague goal such as “understand the topic.” If the user has not supplied learner age, prior knowledge, setting, or time/device limits, infer reasonable defaults and make consequential assumptions visible.

2. **Choose the activity form that fits the outcome.** Distinguish these when the difference affects the design:
   - A **simulation** exposes a model so learners can change conditions and observe system behavior.
   - **Game-based learning** uses play, decisions, and feedback to practice or apply knowledge toward a goal.
   - **Gamification** adds game elements such as points or badges to an activity that otherwise remains non-game work.
   - **Serious game** describes a game's primary purpose; it does not by itself establish that the game teaches effectively.

3. **Connect outcome, player action, and evidence.** The player should perform the action that demonstrates the target skill. If the outcome is comparing plans, provide plans and comparable results; if it is evaluating evidence, make learners find and use evidence. Identify what a player will do or say that lets a teacher or designer recognize the intended learning.

4. **Design a causal core loop.** A useful pattern is: inspect relevant information → predict → choose or act → apply explicit rules → see an interpretable result → explain, adjust, or retry. Make the relationship between a decision and its consequence clear enough to reason about. If knowledge is used only to unlock unrelated gameplay, describe that honestly as quiz-gated play and consider whether a more integrated mechanic better serves the goal.

5. **Make mechanics and incentives support the same goal.** Specify the important game state, player actions, constraints, and how actions change state. State assumptions, units, and rule order when they affect outcomes. Check that scoring, rewards, and progress do not encourage shortcuts that bypass the target thinking. Show relevant trade-offs, not just a win/lose result.

6. **Build challenge and support progressively.** Start with the fewest variables needed to learn the basic relationship, then add constraints or uncertainty in steps. Make failure useful: show relevant evidence, retain decision history when it helps comparison, and allow a meaningful retry. Use prompts or examples when needed, then reduce help as the learner gains skill. Consider readable information, adjustable pace, clear controls, and cues that do not rely on color alone.

7. **Plan how play connects to teaching.** When classroom use is in scope, include a suitable before-play orientation, observations or prompts during play, and an after-play explanation or new scenario. Reserve time for learners to compare decisions and connect outcomes to concepts; do not treat gameplay completion as the whole lesson.

8. **Prototype around a question.** For a new or uncertain mechanic, propose the smallest playable version that can answer a specific design question. Observe what players do, ask why they chose it, and use a changed condition or unfamiliar task to check understanding. Use examples such as resource management or source checking only when they fit the user's subject; do not assume the project must use the source document's water or school-rumor examples.

9. **Evaluate the right outcome.** Separate engagement and participation from learning. Distinguish immediate performance, retention over time, and transfer to a new condition or context. Game scores, play time, and click logs can describe participation or process, but do not by themselves prove understanding; combine them with explanations, decisions, and follow-up tasks appropriate to the learning goal.

## Shape the deliverable to the request

For a game concept or design, make the learning outcome, intended player, core loop, key rules, feedback, progression/support, and evidence of learning clear. For implementation work, map the design to the existing project code and explain meaningful assumptions. For evaluation requests, say what evidence supports the conclusion and what it cannot establish. Keep small requests concise; add a full design brief only when the user asks for one or the scope needs it.
