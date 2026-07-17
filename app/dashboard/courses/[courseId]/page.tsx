"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../../lib/supabase-client";

type Lesson={id:string;title:string;content:string;videoKey?:string;position:number};
type Course={id:string;title:string;description:string;status:string;priceCents:number;lessons:Lesson[]};

export default function CourseBuilder({params}:{params:Promise<{courseId:string}>}){
  const [courseId,setCourseId]=useState("");
  const [course,setCourse]=useState<Course|null>(null);
  const [selected,setSelected]=useState<Lesson|null>(null);
  const [message,setMessage]=useState("Loading course…");
  const supabase=getSupabaseBrowser();

  async function token(){return (await supabase?.auth.getSession())?.data.session?.access_token||""}
  useEffect(()=>{params.then(({courseId})=>setCourseId(courseId))},[params]);
  useEffect(()=>{if(!courseId||!supabase)return;(async()=>{
    const response=await fetch(`/api/courses/${courseId}`,{headers:{authorization:`Bearer ${await token()}`}});
    if(response.status===401){location.href="/login";return}
    if(!response.ok){setMessage("Course not found.");return}
    const loaded=await response.json() as Course;setCourse(loaded);setSelected(loaded.lessons[0]||null);setMessage("");
  })()},[courseId,supabase]);

  function editLesson(patch:Partial<Lesson>){
    if(!course||!selected)return;
    const next={...selected,...patch};setSelected(next);
    setCourse({...course,lessons:course.lessons.map(item=>item.id===next.id?next:item)});
  }
  function addLesson(){
    if(!course)return;
    const lesson={id:crypto.randomUUID(),title:"Untitled lesson",content:"",position:course.lessons.length};
    setCourse({...course,lessons:[...course.lessons,lesson]});setSelected(lesson);setMessage("New lesson ready to edit.");
  }
  async function saveLesson(event?:FormEvent){
    event?.preventDefault();if(!selected)return;setMessage("Saving lesson…");
    const response=await fetch("/api/lessons",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${await token()}`},body:JSON.stringify({courseId,lesson:selected})});
    setMessage(response.ok?"Lesson saved.":"Lesson could not be saved.");
  }
  async function saveCourse(status=course?.status||"draft"){
    if(!course)return;setMessage(status==="published"?"Publishing…":"Saving…");
    if(status==="published"&&!course.lessons.length){setMessage("Add at least one lesson before publishing.");return}
    await saveLesson();
    const response=await fetch(`/api/courses/${courseId}`,{method:"PATCH",headers:{"content-type":"application/json",authorization:`Bearer ${await token()}`},body:JSON.stringify({title:course.title,description:course.description,status,priceCents:course.priceCents})});
    if(response.ok){setCourse({...course,status});setMessage(status==="published"?"Course published — learners can now enrol.":"Course saved.")}
    else setMessage("Course could not be saved.");
  }
  if(!course)return <main className="system-loading"><div><b>✦ NORTHSTARLABS</b><p>{message}</p></div></main>;
  return <main className="builder-page">
    <header className="builder-top"><a href="/dashboard">← Courses</a><div><input aria-label="Course title" value={course.title} onChange={e=>setCourse({...course,title:e.target.value})}/><span>{course.status} · {message||"Ready"}</span></div><div><a className="builder-preview" href={course.status==="published"?`/courses/${course.id}`:"#"}>Preview</a><button className="sys-primary" onClick={()=>saveCourse(course.status==="published"?"draft":"published")}>{course.status==="published"?"Unpublish":"Save & publish"}</button></div></header>
    <div className="builder-layout"><aside className="curriculum"><div><p className="sys-kicker">CURRICULUM</p><b>{course.lessons.length} lessons</b></div><section>{course.lessons.map((lesson,index)=><button className={selected?.id===lesson.id?"active":""} onClick={()=>setSelected(lesson)} key={lesson.id}><span>{index+1}</span><div><b>{lesson.title}</b><small>Lesson</small></div><i>○</i></button>)}</section><div className="add-menu"><button onClick={addLesson}>＋ Add lesson</button></div></aside>
    <section className="lesson-editor">{selected?<><div className="editor-heading"><div><p className="sys-kicker">LESSON EDITOR</p><h1>{selected.title}</h1></div></div><form onSubmit={saveLesson}><label>Lesson title<input value={selected.title} onChange={e=>editLesson({title:e.target.value})}/></label><label>Lesson content<textarea className="content-editor" value={selected.content} onChange={e=>editLesson({content:e.target.value})} placeholder="Write the lesson, instructions, links, and resources here."/></label><label>Video link (optional)<input value={selected.videoKey||""} onChange={e=>editLesson({videoKey:e.target.value})} placeholder="https://…"/></label><button className="sys-primary">Save lesson</button></form></>:<div className="empty-dashboard"><h2>Add your first lesson</h2><p>Courses need at least one lesson before they can be published.</p><button className="sys-primary" onClick={addLesson}>＋ Add lesson</button></div>}</section></div>
  </main>
}
