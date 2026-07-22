"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  BranchActivity,
  ClassificationActivity,
  LessonExperience,
  MeterActivity,
} from "../../../lib/lesson-experience";

function NarratedStory({ experience }: { experience: LessonExperience }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [narration, setNarration] = useState(false);
  const scene = experience.scenes[sceneIndex];

  useEffect(() => {
    if (!playing) return;
    const timeout = window.setTimeout(() => {
      if (sceneIndex < experience.scenes.length - 1) setSceneIndex((current) => current + 1);
      else setPlaying(false);
    }, 6_500);
    return () => window.clearTimeout(timeout);
  }, [experience.scenes.length, playing, sceneIndex]);

  useEffect(() => {
    if (!narration || !playing || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${scene.title}. ${scene.body}`);
    utterance.rate = 0.98;
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [narration, playing, scene]);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return <section className={`experience-story tone-${scene.tone || "blue"}`} aria-label="Guided visual story">
    <div className="experience-story-copy" aria-live="polite">
      <span>{scene.label}</span>
      <h3>{scene.title}</h3>
      {scene.metric && <strong>{scene.metric}</strong>}
      <p>{scene.body}</p>
    </div>
    <div className="experience-signal" aria-hidden="true">
      <i /><i /><i /><i /><i /><i />
      <b>{String(sceneIndex + 1).padStart(2, "0")}</b>
    </div>
    <div className="experience-story-controls">
      <button type="button" onClick={() => setPlaying((current) => !current)}>
        {playing ? "Pause story" : sceneIndex === experience.scenes.length - 1 ? "Replay story" : "Play guided story"}
      </button>
      <button
        type="button"
        className={narration ? "active" : ""}
        aria-pressed={narration}
        onClick={() => setNarration((current) => !current)}
      >{narration ? "Narration on" : "Add narration"}</button>
      <div aria-label={`Scene ${sceneIndex + 1} of ${experience.scenes.length}`}>
        {experience.scenes.map((item, index) => <button
          type="button"
          key={item.id}
          className={index === sceneIndex ? "active" : ""}
          aria-label={`Open ${item.label}`}
          onClick={() => { setPlaying(false); setSceneIndex(index); }}
        />)}
      </div>
    </div>
  </section>;
}

function ClassificationLab({ activity }: { activity: ClassificationActivity }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correct = activity.cards.filter((card) => answers[card.id] === card.bucketId).length;
  return <div className="experience-activity">
    <div className="experience-activity-heading"><span>SIGNAL SORT</span><h3>{activity.title}</h3><p>{activity.prompt}</p></div>
    <div className="experience-buckets">{activity.buckets.map((bucket) => <div key={bucket.id}><b>{bucket.label}</b><span>{bucket.description}</span></div>)}</div>
    <div className="experience-card-stack">{activity.cards.map((card, index) => {
      const isCorrect = answers[card.id] === card.bucketId;
      return <div className={checked ? (isCorrect ? "correct" : "incorrect") : ""} key={card.id}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <p>{card.text}</p>
        <label>
          <span>Classify this evidence</span>
          <select value={answers[card.id] || ""} onChange={(event) => {
            setChecked(false);
            setAnswers((current) => ({ ...current, [card.id]: event.target.value }));
          }}>
            <option value="">Choose a category</option>
            {activity.buckets.map((bucket) => <option key={bucket.id} value={bucket.id}>{bucket.label}</option>)}
          </select>
        </label>
        {checked && <small>{isCorrect ? "Correct. " : "Reconsider. "}{card.feedback}</small>}
      </div>;
    })}</div>
    <button className="experience-check" type="button" disabled={Object.keys(answers).length !== activity.cards.length} onClick={() => setChecked(true)}>Check my evidence sorting</button>
    {checked && <p className="experience-result" role="status"><b>{correct}/{activity.cards.length} correct.</b> {correct === activity.cards.length ? "You separated signal from noise." : "Use the feedback, adjust the cards and check again."}</p>}
  </div>;
}

function BranchLab({ activity }: { activity: BranchActivity }) {
  const [selected, setSelected] = useState("");
  const result = activity.options.find((option) => option.id === selected);
  return <div className="experience-activity">
    <div className="experience-activity-heading"><span>DECISION POINT</span><h3>{activity.title}</h3><p>{activity.prompt}</p></div>
    <div className="experience-branch-options">{activity.options.map((option) => <button
      type="button"
      className={selected === option.id ? "selected" : ""}
      key={option.id}
      onClick={() => setSelected(option.id)}
    >{option.label}<span>Choose this response →</span></button>)}</div>
    {result && <div className={`experience-branch-result ${result.tone}`} role="status"><span>{result.verdict}</span><p>{result.feedback}</p><button type="button" onClick={() => setSelected("")}>Explore another decision</button></div>}
  </div>;
}

function ConfidenceLab({ activity }: { activity: MeterActivity }) {
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(
    activity.dimensions.map((dimension) => [dimension.id, dimension.initial]),
  ));
  const score = useMemo(() => {
    const totalWeight = activity.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0) || 1;
    return Math.round(activity.dimensions.reduce((sum, dimension) =>
      sum + (values[dimension.id] || 0) * dimension.weight, 0) / totalWeight);
  }, [activity.dimensions, values]);
  const result = activity.thresholds.find((threshold) => score <= threshold.max) || activity.thresholds.at(-1)!;
  return <div className="experience-activity">
    <div className="experience-activity-heading"><span>CONFIDENCE LAB</span><h3>{activity.title}</h3><p>{activity.prompt}</p></div>
    <div className="experience-meter-grid"><div>{activity.dimensions.map((dimension) => <label key={dimension.id}>
      <b>{dimension.label}<span>{values[dimension.id]}%</span></b>
      <input type="range" min="0" max="100" step="10" value={values[dimension.id]} onChange={(event) => setValues((current) => ({ ...current, [dimension.id]: Number(event.target.value) }))} />
      <small><span>{dimension.lowLabel}</span><span>{dimension.highLabel}</span></small>
    </label>)}</div><aside className={result.tone}>
      <span>Evidence confidence</span><strong>{score}</strong><b>{result.label}</b><p>{result.feedback}</p>
    </aside></div>
  </div>;
}

export function InteractiveLessonExperience({ experience }: { experience: LessonExperience }) {
  return <section className="lesson-experience">
    <header><p>{experience.eyebrow}</p><h2>{experience.title}</h2><span>{experience.intro}</span></header>
    <NarratedStory experience={experience} />
    {experience.activity.kind === "classify" && <ClassificationLab activity={experience.activity} />}
    {experience.activity.kind === "branch" && <BranchLab activity={experience.activity} />}
    {experience.activity.kind === "meter" && <ConfidenceLab activity={experience.activity} />}
    {experience.takeaway && <footer><span>KEEP THIS</span><p>{experience.takeaway}</p></footer>}
  </section>;
}
