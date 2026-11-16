"use strict";
const sample = {
  peers: [
    {id:"amina",name:"Amina S.",role:"Frontend development",language:"JavaScript",level:"Intermediate",skills:"React, UI design",interests:"Building accessible web apps",goal:"Find a backend partner for a study planner."},
    {id:"daniel",name:"Daniel K.",role:"Data science",language:"Python",level:"Beginner",skills:"Pandas, data visualization",interests:"Open data and machine learning",goal:"Join a team for my first hackathon."},
    {id:"mira",name:"Mira T.",role:"Backend development",language:"Java",level:"Advanced",skills:"Spring Boot, SQL",interests:"APIs and system design",goal:"Build an API with a frontend teammate."},
    {id:"timur",name:"Timur A.",role:"Application development",language:"JavaScript",level:"Beginner",skills:"HTML, CSS",interests:"Web accessibility",goal:"Find an accountability partner for weekly coding practice."}
  ],
  mentors: [
    {id:"leila",name:"Leila M.",role:"Software Engineer",skills:"Backend, APIs, system design",goal:"Four years building APIs and mentoring junior developers.",topics:"Backend roadmaps, REST API design, technical interviews"},
    {id:"alex",name:"Alex R.",role:"Data Engineer",skills:"Python, SQL, data pipelines",goal:"Five years working with analytics teams and data platforms.",topics:"Data careers, portfolio reviews, SQL interviews"},
    {id:"sara",name:"Sara D.",role:"Product Designer",skills:"UX research, Figma, prototyping",goal:"Three years designing digital products with engineering teams.",topics:"Design portfolios, user research, working with developers"}
  ],
  groups: [
    {id:"campus",name:"Campus Tools Lab",kind:"Project team",skills:"React, APIs",goal:"Build a tool that helps students find study spaces on campus."},
    {id:"python",name:"Python Practice Circle",kind:"Study group",skills:"Python, algorithms",goal:"Work through a short coding exercise together each week."},
    {id:"hack",name:"First Hackathon Crew",kind:"Hackathon team",skills:"Design, JavaScript, Python",goal:"Form a beginner-friendly team and ship a small demo."},
    {id:"startup",name:"Student Startup Studio",kind:"Startup team",skills:"Product discovery, design",goal:"Interview potential users and prototype a campus service."}
  ],
  careers: [
    {id:"front",name:"Frontend Engineer",role:"Build usable web interfaces",skills:"HTML, CSS, JavaScript",goal:"Turn designs into responsive interfaces, integrate APIs and test accessibility.",benefit:"You can see the results of your work and iterate quickly.",challenge:"You need to handle different devices, browsers and accessibility needs.",next:"Build a responsive dashboard using a public dataset."},
    {id:"back",name:"Backend Engineer",role:"Build services and data flows",skills:"HTTP, SQL, Java or Python",goal:"Design APIs, model data and keep services reliable.",benefit:"You learn how systems fit together and support many users.",challenge:"Debugging data and performance issues takes practice.",next:"Build and test a small REST API with a database."},
    {id:"data",name:"Data Analyst",role:"Answer questions with data",skills:"SQL, statistics, visualization",goal:"Clean data, identify patterns and communicate findings.",benefit:"Your analysis can help teams choose what to do next.",challenge:"Incomplete data and ambiguous questions are common.",next:"Create a chart and a short analysis using an open dataset."}
  ],
  opportunities: [
    {id:"hguide",name:"Enter a hackathon",role:"Hands-on guide",skills:"Team roles, demo, timeboxing",goal:"Choose a problem, gather complementary skills and build a small demo.",steps:["Agree on the problem and the user.","Split ownership of the interface, data and presentation.","Reserve time to rehearse a short demo."],kind:"Hackathon team"},
    {id:"sguide",name:"Explore a startup idea",role:"Hands-on guide",skills:"Discovery, prototyping",goal:"Take a student problem from observation to first prototype.",steps:["Identify one recurring problem.","Prepare questions for potential users.","Build a small prototype and decide what to check."],kind:"Startup team"}
  ]
};
const key = "skillswap-final-v1";
let state = {profile:null,groups:[],requests:[],reviews:{}};
try { state = {...state,...JSON.parse(localStorage.getItem(key) || "{}")}; } catch {}
const save = () => {
  try {localStorage.setItem(key,JSON.stringify(state));return true;} catch {return false;}
};
const $ = selector => document.querySelector(selector);
const root = $("#workspace");
const modal = $("#details");
const detail = $("#detail");
const esc = value => String(value ?? "").replace(/[&<>"']/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[x]);
const tag = value => '<span class="pill">'+esc(value)+'</span>';
const listTags = value => '<div class="tags">'+value.split(",").map(s=>"<span>"+esc(s.trim())+"</span>").join("")+"</div>";
const options = values => values.map(x=>'<option>'+esc(x)+'</option>').join("");
const links = {
  peers:["Discover peers","Search by skill, interest or goal to find someone to build with."],
  mentors:["Find a mentor","Explore sample mentors by experience and guidance topic."],
  groups:["Teams & groups","Find a team for a project or create your own study group."],
  careers:["Explore career paths","Compare responsibilities, skills and practical first steps."],
  opportunities:["Practical opportunities","Prepare for a hackathon or explore a startup idea."],
  profile:["My profile","Show prospective collaborators what you know and want to learn."]
};
const languages = ["JavaScript","Python","Java","TypeScript","C++","C#","Go","Other"];
const levels = ["Beginner","Intermediate","Advanced"];
const kinds = ["Project team","Study group","Hackathon team","Startup team"];
let view = "peers";
let filter = {q:"",language:"",level:"",kind:""};
function entries(){
  if(view==="peers" && state.profile) return [...sample.peers,{...state.profile,id:"self",role:"Your demo profile"}];
  if(view==="groups") return [...sample.groups,...state.groups];
  return sample[view];
}
function card(item){
  const initials = item.name.trim().split(/\s+/).slice(0,2).map(p=>p[0]).join("");
  return '<article class="card"><span class="avatar" aria-hidden="true">'+esc(initials)+'</span><h3>'+esc(item.name)+'</h3><p class="muted">'+esc(item.role || item.kind)+'</p><p>'+esc(item.goal)+'</p>'+listTags(item.skills)+
    (item.level?tag(item.language+" · "+item.level):"")+'<div class="actions"><button class="btn" type="button" data-open="'+esc(item.id)+'">View '+({peers:"profile",mentors:"mentor",groups:"group",careers:"path",opportunities:"guide"})[view]+'</button></div></article>';
}
function showCards(){
  const query = filter.q.trim().toLowerCase();
  const matches = entries().filter(x=>[x.name,x.role,x.kind,x.skills,x.goal,x.interests,x.topics,x.language].join(" ").toLowerCase().includes(query)
  && (!filter.language || x.language===filter.language) && (!filter.level || x.level===filter.level) && (!filter.kind || x.kind===filter.kind));
  $("#count").textContent = matches.length+" "+(matches.length===1?"result":"results");
  $("#cards").innerHTML = matches.map(card).join("") || $("#empty").innerHTML;
}
function field(label,name,value="",placeholder="",length=80){
  return '<label>'+label+'<input name="'+name+'" value="'+esc(value)+'" placeholder="'+esc(placeholder)+'" maxlength="'+length+'" required></label>';
}
function area(label,name,value=""){
  return '<label>'+label+'<textarea name="'+name+'" maxlength="350" required>'+esc(value)+'</textarea></label>';
}
function select(label,name,values,first=""){
  return '<label>'+label+'<select name="'+name+'"'+(first?'':' required')+'>'+(first?'<option value="">'+first+'</option>':'')+options(values)+'</select></label>';
}
function telegram(value="",checked=false) {
  return '<label>Telegram username (optional)<input name="telegram" value="'+esc(value)+'" placeholder="username" pattern="[A-Za-z][A-Za-z0-9_]{4,31}" title="5–32 letters, digits or underscores, starting with a letter" maxlength="32"></label><label class="check"><input type="checkbox" name="share" '+(checked?'checked':'')+'> Show my Telegram link on this demo listing</label>';
}
const profileForm = () => {
  const p = state.profile || {};
  return '<form id="profile-form" class="form panel">'+field("Display name","name",p.name,"Your name")+select("Programming language","language",languages)+select("Skill level","level",levels)+field("Skills","skills",p.skills,"React, SQL",120)+field("Interests","interests",p.interests,"Web development",120)+area("What are you working toward?","goal",p.goal)+telegram(p.telegram,p.share)+'<button class="btn primary">Save profile</button><p class="notice" role="status"></p></form>';
};
function render(){
  const next = location.hash.slice(1);
  view = Object.hasOwn(links,next)?next:"peers";
  const kind = filter.kind;
  filter = {q:"",language:"",level:"",kind:view==="groups"?kind:""};
  for(const a of document.querySelectorAll("nav a,.profile")) {
    if(a.hash==="#"+view) a.setAttribute("aria-current","page");
    else a.removeAttribute("aria-current");
  }
  root.innerHTML = '<div class="section-head"><div><h2>'+links[view][0]+'</h2><p>'+links[view][1]+'</p></div>'+
    (view==="groups"?'<button class="btn primary" type="button" data-create>Create group</button>':view==="peers"?'<a class="btn primary" href="#profile">My profile</a>':"")+"</div>";
  if(view==="profile"){
    root.insertAdjacentHTML("beforeend",profileForm());
    if(state.profile) for(const name of ["language","level"]) $("#profile-form").elements[name].value=state.profile[name];
    return;
  }
  const category = view==="peers"?select("Language","language",languages,"All languages")+select("Skill level","level",levels,"All levels"):view==="groups"?select("Group type","kind",kinds,"All types"):"";
  root.insertAdjacentHTML("beforeend",'<form class="controls '+(view==="groups"?"double":view==="peers"?"":"single")+'" id="filters"><label>Search<input type="search" name="q" placeholder="'+(view==="peers"?"Try React, APIs, or hackathon":"Search "+links[view][0].toLowerCase())+'"></label>'+category+'</form><p class="count" id="count" role="status"></p><div id="cards" class="grid"></div>');
  if(view==="groups") $("#filters").elements.kind.value=filter.kind;
  showCards();
}
function open(content){
  detail.innerHTML = content;
  if(!modal.open) modal.showModal();
}
function title(name,desc){
  return '<h2 id="detail-title">'+esc(name)+'</h2><p class="muted">'+esc(desc)+'</p>';
}
function contact(item){
  const prompt = view==="mentors"
    ? "Hi "+item.name+"! I found your profile on SkillSwap. Could I ask you for advice about "+item.topics.split(",")[0].toLowerCase()+"?"
    : "Hi "+item.name+"! I found your profile on SkillSwap. Would you be interested in collaborating on a student project?";
  const heading = view==="mentors"?"Ask for guidance":"Invite to collaborate";
  return '<details class="contact"><summary>'+heading+'</summary><p class="muted">This sample profile has no Telegram account. You can adapt the draft for a real contact.</p><label>Message draft<textarea maxlength="500">'+esc(prompt)+'</textarea></label><button class="btn" type="button" data-copy-message>Copy message</button><p class="notice" role="status"></p></details>';
}
function openEntry(id){
  const item=entries().find(x=>x.id===id);
  if(!item) return;
  let content=title(item.name,item.role || item.kind)+'<p>'+esc(item.goal)+'</p>'+listTags(item.skills);
  if(item.level) content+='<p>'+tag(item.language+" · "+item.level)+'</p><p><strong>Interests</strong> '+esc(item.interests)+'</p>';
  if(item.topics) content+='<p><strong>Guidance topics</strong> '+esc(item.topics)+'</p>';
  if(item.share && /^[a-z][a-z0-9_]{4,31}$/i.test(item.telegram)) {
    content+='<p><a class="btn primary" href="https://t.me/'+esc(item.telegram)+'" target="_blank" rel="noopener noreferrer">Message on Telegram</a></p>';
  } else if((view==="peers" && id!=="self") || view==="mentors"){
    content+=contact(item);
  }
  if(view==="groups") {
    const requested=state.requests.includes(id);
    content+='<p class="muted">Join requests are recorded in this browser.</p><p><button class="btn primary" type="button" data-join="'+id+'" '+(requested?'disabled':'')+'>'+(requested?'Request recorded':'Request to join')+'</button></p><p class="notice" role="status"></p>';
  }
  if(view==="careers"){
    content+='<p><strong>Why choose it?</strong> '+esc(item.benefit)+'</p><p><strong>Common challenge</strong> '+esc(item.challenge)+'</p><p><strong>First project</strong> '+esc(item.next)+'</p>';
  }
  if(view==="opportunities"){
    content+='<ol>'+item.steps.map(step=>"<li>"+esc(step)+"</li>").join("")+'</ol><button class="btn primary" data-group-kind="'+esc(item.kind)+'">Find a team</button>';
  }
  if((view==="peers" && id!=="self") || view==="mentors"){
    const reviews=state.reviews[id] || [];
    const reviewRows=reviews.map(x=>'<li><strong>'+esc(x.rating)+'/5</strong> · '+esc(x.comment)+'</li>').join("");
    content+='<h3 style="margin-top:22px">Collaboration feedback</h3><ul class="reviews">'+(reviewRows || '<li class="muted">No demo feedback yet.</li>')+'</ul><form class="form" id="review-form" data-id="'+id+'">'+select("Rating","rating",["5","4","3","2","1"])+area("Feedback","comment")+'<button class="btn primary">Save demo feedback</button></form><p class="notice" role="status"></p>';
  }
  open(content);
}
function persistMessage(success){
  return save()?success:"Changes are available for this session. Browser storage is unavailable.";
}
root.addEventListener("input",event=>{
  if(event.target.form?.id!=="filters") return;
  filter={...filter,[event.target.name]:event.target.value};
  showCards();
});
root.addEventListener("click",event=>{
  const button=event.target.closest("button");
  if(!button) return;
  if(button.dataset.open) openEntry(button.dataset.open);
  if(button.hasAttribute("data-create")){
    open(title("Create a group","Give collaborators a clear goal.")+'<form class="form" id="group-form">'+field("Group name","name")+select("Group type","kind",kinds)+field("Skills needed","skills","", "Design, Python",120)+area("Group goal","goal")+telegram()+'<button class="btn primary">Create group</button><p class="notice" role="status"></p></form>');
  }
});
detail.addEventListener("click",async event=>{
  const button=event.target.closest("button");
  if(!button) return;
  if(button.hasAttribute("data-copy-message")){
    const section=button.closest(".contact");
    const draft=section.querySelector("textarea");
    const status=section.querySelector(".notice");
    try {
      await navigator.clipboard.writeText(draft.value);
      status.textContent="Message copied.";
    } catch {
      draft.focus();
      draft.select();
      status.textContent="Message selected. Press Ctrl+C or use your device’s Copy action.";
    }
    return;
  }
  if(button.dataset.join && !state.requests.includes(button.dataset.join)){
    state.requests.push(button.dataset.join);
    const message=persistMessage("Join request recorded.");
    button.disabled=true;
    button.textContent="Request recorded";
    detail.querySelector(".notice").textContent=message;
  }
  if(button.dataset.groupKind){
    const already=view==="groups";
    filter.kind=button.dataset.groupKind;
    modal.close();
    location.hash="groups";
    if(already) render();
    requestAnimationFrame(()=>root.scrollIntoView());
  }
});
function formData(form){
  return Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,value.trim()]));
}
function valid(form,data){
  for(const input of form.querySelectorAll("[required]")){
    if(!data[input.name]){
      input.focus();
      form.querySelector(".notice")?.replaceChildren("Please enter a value for "+input.labels[0].firstChild.textContent+".");
      return false;
    }
  }
  return true;
}
root.addEventListener("submit",event=>{
  event.preventDefault();
  if(event.target.id!=="profile-form") return;
  const data=formData(event.target);
  if(!valid(event.target,data)) return;
  state.profile=data;
  event.target.querySelector(".notice").textContent=persistMessage("Profile saved. Find it in Discover peers.");
});
detail.addEventListener("submit",event=>{
  const form=event.target;
  event.preventDefault();
  const data=formData(form);
  if(!valid(form,data)) return;
  if(form.id==="group-form"){
    const id="group-"+Date.now()+"-"+Math.random().toString(36).slice(2);
    state.groups.push({...data,id});
    const message=persistMessage("Group created.");
    filter={q:"",language:"",level:"",kind:""};
    render();
    openEntry(id);
    detail.querySelector(".notice").textContent=message;
  }
  if(form.id==="review-form"){
    (state.reviews[form.dataset.id] ??= []).push(data);
    const message=persistMessage("Demo feedback saved.");
    openEntry(form.dataset.id);
    detail.querySelector(".notice").textContent=message;
    detail.querySelector("select").focus();
  }
});
window.addEventListener("hashchange",()=>{
  if(modal.open) modal.close();
  render();
});
render();
