(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{23:function(e,a,t){e.exports=t(61)},28:function(e,a,t){},30:function(e,a,t){},35:function(e,a,t){},37:function(e,a,t){},39:function(e,a,t){},41:function(e,a,t){},43:function(e,a,t){},45:function(e,a,t){},47:function(e,a,t){},49:function(e,a,t){},61:function(e,a,t){"use strict";t.r(a);var n=t(0),l=t.n(n),r=t(8),c=t.n(r),o=(t(28),t(2)),i=t(3),s=t(5),u=t(4),m=t(6),d=(t(30),t(17)),p=t.n(d);function v(e,a){return p()(e,a).tz("America/New_York")}var f,h,b="https://dl.dropboxusercontent.com/s/kcwrqyr8455lsq6/nba-daily.json";function g(){return fetch(b,{method:"GET",headers:{Accept:"application/json","Content-Type":"application/json"},credentials:"same-origin"}).then(function(e){return e.json()})}function E(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};Object.assign(f,e),localStorage.setItem("nbaDailyGlobalState",JSON.stringify(f)),h.forEach(function(e){return e.setState(f)})}function y(){return f}function k(e){h.push(e)}function O(e){h=h.filter(function(a){return a!==e})}!function(){try{f=JSON.parse(localStorage.getItem("nbaDailyGlobalState"))}catch(e){}f=Object.assign({favTeams:[],rankings:{},lastUpdate:null,gameDates:[]},f,{currentSection:null,videoPlaying:null}),h=[]}();t(35);var j=function(e){function a(){var e,t;Object(o.a)(this,a);for(var n=arguments.length,l=new Array(n),r=0;r<n;r++)l[r]=arguments[r];return(t=Object(s.a)(this,(e=Object(u.a)(a)).call.apply(e,[this].concat(l)))).handleLogoPress=function(){E({isFetching:!0}),g().then(function(e){E({isFetching:!1,lastUpdate:e.lastUpdate,gameDates:e.gameDates,rankings:e.rankings})})},t}return Object(m.a)(a,e),Object(i.a)(a,[{key:"componentDidMount",value:function(){k(this)}},{key:"componentWillUnmount",value:function(){O(this)}},{key:"render",value:function(){var e=y(),a=v(this.props.lastUpdate).fromNow();return l.a.createElement("header",{id:"header"},l.a.createElement("h1",null,"NBA Daily"),e.isFetching?l.a.createElement("span",null,"loading..."):l.a.createElement("button",{onClick:this.handleLogoPress,className:"LastUpdate"},"updated ",a))}}]),a}(n.Component),C=(t(37),function(e){function a(){return Object(o.a)(this,a),Object(s.a)(this,Object(u.a)(a).apply(this,arguments))}return Object(m.a)(a,e),Object(i.a)(a,[{key:"render",value:function(){return l.a.createElement("footer",null,l.a.createElement("br",null),l.a.createElement("ul",null,l.a.createElement("li",null,l.a.createElement("a",{style:{paddingBottom:10,textDecoration:"none",color:"#555",display:"block",textAlign:"right"},href:"https://github.com/gingerbear/nba-daily"},"Github"))))}}]),a}(n.Component)),N=(t(39),function(e){function a(){return Object(o.a)(this,a),Object(s.a)(this,Object(u.a)(a).apply(this,arguments))}return Object(m.a)(a,e),Object(i.a)(a,[{key:"render",value:function(){var e=y().rankings;return l.a.createElement("div",{className:"Ranking",id:"ranking"},l.a.createElement("div",{className:"Ranking-body"},l.a.createElement("ul",null,l.a.createElement("li",null,l.a.createElement("span",{className:"rank"}),"West"),e.west.map(function(e,a){return l.a.createElement("li",{className:"rank-".concat(a),key:a},l.a.createElement("span",{className:"rank"},a+1),l.a.createElement("img",{src:"images/".concat(e.teamCode.toLowerCase(),".gif"),alt:e.teamCode}),l.a.createElement("span",{className:"team-name"},e.teamCode),l.a.createElement("span",{className:"win-record"},"(",e.win,"-",e.loss,")"),l.a.createElement("span",{className:"behind"},"+",e.behind))})),l.a.createElement("ul",null,l.a.createElement("li",null,"East"),e.east.map(function(e,a){return l.a.createElement("li",{className:"rank-".concat(a),key:a},l.a.createElement("img",{src:"images/".concat(e.teamCode.toLowerCase(),".gif"),alt:e.teamCode}),l.a.createElement("span",{className:"team-name"},e.teamCode),l.a.createElement("span",{className:"win-record"},"(",e.win,"-",e.loss,")"),l.a.createElement("span",{className:"behind"},"+",e.behind))}))))}}]),a}(n.Component)),w=(t(41),window.navigator.userAgent.indexOf("Android")>-1),T=function(e){function a(){var e,t;Object(o.a)(this,a);for(var n=arguments.length,l=new Array(n),r=0;r<n;r++)l[r]=arguments[r];return(t=Object(s.a)(this,(e=Object(u.a)(a)).call.apply(e,[this].concat(l)))).playVideo=function(e){t.videoPlayer=document.createElement("video"),t.videoPlayer.src=e,t.videoPlayer.controls=!0,t.videoPlayer.addEventListener("ended",t.onVideoEnded,!1),t.videoPlayer.play(),w&&(t.refs.videoContainer.innerHTML="",t.refs.videoContainer.appendChild(t.videoPlayer))},t.onVideoEnded=function(e){t.videoPlayer.webkitExitFullscreen()},t.retryPlay=function(e){e?t.playVideo(e):(t.videoPlayer&&t.videoPlayer.pause(),t.refs.videoContainer.innerHTML="")},t.close=function(e){E({videoPlaying:null})},t}return Object(m.a)(a,e),Object(i.a)(a,[{key:"componentWillReceiveProps",value:function(e){e.video!==this.props.video&&this.retryPlay(e.video)}},{key:"componentDidMount",value:function(){this.retryPlay(this.props.video)}},{key:"render",value:function(){return l.a.createElement("div",{className:"video-play-section"},l.a.createElement("div",{ref:"videoContainer",className:"videoContainer"}),this.props.video&&l.a.createElement("button",{className:"videoCloseButton",onClick:this.close},"\xd7"))}}]),a}(n.Component),P=(t(43),function(e){function a(){return Object(o.a)(this,a),Object(s.a)(this,Object(u.a)(a).apply(this,arguments))}return Object(m.a)(a,e),Object(i.a)(a,[{key:"render",value:function(){var e=this;return l.a.createElement("ul",{className:"PageAnchers"},this.props.gameDates.map(function(a,t){var n=v(new Date(+a.timestamp)).calendar().split("at")[0].trim();return l.a.createElement("li",{key:t},"games-".concat(t)===e.props.currentSection?l.a.createElement("span",null,n):l.a.createElement("a",{href:"#games-".concat(t)},n))}),l.a.createElement("li",null,"ranking"===this.props.currentSection?l.a.createElement("span",null,"Ranking"):l.a.createElement("a",{href:"#ranking"},"Ranking")),l.a.createElement("li",null,"fav"===this.props.currentSection?l.a.createElement("span",null,"Fav"):l.a.createElement("a",{href:"#fav"},"Fav")))}}]),a}(n.Component)),S=t(9),D=t.n(S),L=(t(45),function(e){function a(){return Object(o.a)(this,a),Object(s.a)(this,Object(u.a)(a).apply(this,arguments))}return Object(m.a)(a,e),Object(i.a)(a,[{key:"renderRank",value:function(e){var a=y().rankings,t=null,n=null;return a.east.find(function(a){return a.teamCode===e})?(n="e",t=a.east.findIndex(function(a){return a.teamCode===e})):(n="w",t=a.west.findIndex(function(a){return a.teamCode===e})),l.a.createElement("span",{className:"conf-".concat(n)},t+1)}},{key:"render",value:function(){return l.a.createElement("div",{className:"TeamIcon"},this.renderRank(this.props.teamInfo.triCode),l.a.createElement("img",{src:"images/".concat(this.props.teamInfo.triCode.toLowerCase(),".gif"),alt:this.props.teamInfo.triCode}),l.a.createElement("span",null,this.props.teamInfo.triCode,l.a.createElement("span",{className:"WinLoss"},"(",this.props.teamInfo.win,"-",this.props.teamInfo.loss,")")))}}]),a}(n.Component)),I=(t(47),"ontouchstart"in document.documentElement);var x=function(e){function a(){var e,t;Object(o.a)(this,a);for(var n=arguments.length,l=new Array(n),r=0;r<n;r++)l[r]=arguments[r];return(t=Object(s.a)(this,(e=Object(u.a)(a)).call.apply(e,[this].concat(l)))).playVideo=function(e){I&&(e.preventDefault(),E({videoPlaying:e.target.href}))},t}return Object(m.a)(a,e),Object(i.a)(a,[{key:"render",value:function(){var e=y().favTeams,a=this.props.game,t=v(a.startTimeUTC).calendar(),n=a.period.current<4&&a.period.current>0||""!==a.clock||a.period.isEndOfPeriod||a.period.isHalftime,r=!n&&0!==+a.hTeam.score&&0!==+a.vTeam.score,c=+a.hTeam.score>+a.vTeam.score,o=r&&c?"score win":"score",i=r?c?"score":"score win":"score",s=n?l.a.createElement("span",{className:"GameBadge"},"playing Q",a.period.current,"..."):null,u="GameItem"+(function(e,a){var t=e.map(function(e){return e.value});return t.indexOf(a[0].triCode.toLowerCase())>-1||t.indexOf(a[1].triCode.toLowerCase())>-1}(e,[a.hTeam,a.vTeam])?" isFavTeam":""),m=(a.watch.broadcast.broadcasters.national||[]).map(function(e){return e.shortName}).join(""),d=a.playoffs&&a.playoffs.seriesSummaryText,p=a.nugget.text?a.nugget.text:m;return l.a.createElement("div",{className:u},l.a.createElement("div",{className:"GameDate"},t," ",s),l.a.createElement("div",{className:"line"},l.a.createElement("div",{className:"GameSide"},l.a.createElement(L,{teamInfo:a.hTeam}),l.a.createElement("span",{className:o},a.hTeam.score)),l.a.createElement("div",{className:"GameSide"},l.a.createElement("span",{className:i},a.vTeam.score),l.a.createElement(L,{teamInfo:a.vTeam})),l.a.createElement("div",{className:"GameRecap"},a.recapLink?l.a.createElement("a",{className:"PlayButton",onClick:this.playVideo,href:a.recapLink},l.a.createElement("span",{className:"PlayIcon"})):null)),l.a.createElement("p",null,d," | ",p))}}]),a}(n.Component),A=(t(49),function(e){function a(){return Object(o.a)(this,a),Object(s.a)(this,Object(u.a)(a).apply(this,arguments))}return Object(m.a)(a,e),Object(i.a)(a,[{key:"render",value:function(){var e=this.props.games.map(function(e,a){return l.a.createElement("li",{key:a},l.a.createElement(x,{game:e}))});return l.a.createElement("ul",{className:"game-list"},e)}}]),a}(n.Component)),U=t(22),M=[{value:"atl",label:"Atlanta Hawks"},{value:"bkn",label:"Brooklyn Nets"},{value:"bos",label:"Boston Celtics"},{value:"cha",label:"Charlotte Hornets"},{value:"chi",label:"Chicago Bulls"},{value:"cle",label:"Cleveland Cavaliers"},{value:"dal",label:"Dallas Mavericks"},{value:"den",label:"Denver Nuggets"},{value:"det",label:"Detroit Pistons"},{value:"gsw",label:"Golden State Warriors"},{value:"hou",label:"Houston Rockets"},{value:"ind",label:"Indiana Pacers"},{value:"lac",label:"Los Angeles Clippers"},{value:"lal",label:"Los Angeles Lakers"},{value:"mem",label:"Memphis Grizzlies"},{value:"mia",label:"Miami Heat"},{value:"mil",label:"Milwaukee Bucks"},{value:"min",label:"Minnesota Timberwolves"},{value:"nop",label:"New Orleans Pelicans"},{value:"nyk",label:"New York Knicks"},{value:"okc",label:"Oklahoma City Thunder"},{value:"orl",label:"Orlando Magic"},{value:"phi",label:"Philadelphia 76ers"},{value:"phx",label:"Phoenix Suns"},{value:"por",label:"Portland Trail Blazers"},{value:"sac",label:"Sacramento Kings"},{value:"sas",label:"San Antonio Spurs"},{value:"tor",label:"Toronto Raptors"},{value:"uta",label:"Utah Jazz"},{value:"was",label:"Washington Wizards"}],G=function(e){function a(){var e,t;Object(o.a)(this,a);for(var n=arguments.length,l=new Array(n),r=0;r<n;r++)l[r]=arguments[r];return(t=Object(s.a)(this,(e=Object(u.a)(a)).call.apply(e,[this].concat(l)))).handleChange=function(e){E({favTeams:e})},t}return Object(m.a)(a,e),Object(i.a)(a,[{key:"render",value:function(){return l.a.createElement(U.a,{name:"fav-teams",isMulti:!0,closeMenuOnSelect:!1,value:y().favTeams,options:M,onChange:this.handleChange})}}]),a}(n.Component),B=function(e){function a(e){var t;return Object(o.a)(this,a),(t=Object(s.a)(this,Object(u.a)(a).call(this,e))).goToSection=function(){E({currentSection:(window.location.hash||"").replace("#","")||"games-".concat(t.getDefaultDate())})},t.state={data:null},t}return Object(m.a)(a,e),Object(i.a)(a,[{key:"componentDidMount",value:function(){return k(this),window.onhashchange=this.goToSection,this.goToSection(),g().then(function(e){E({lastUpdate:e.lastUpdate,gameDates:e.gameDates,rankings:e.rankings})})}},{key:"getDefaultDate",value:function(){var e=D()().hour();return e>5&&e<=12?0:1}},{key:"componentWillUnmount",value:function(){O(this)}},{key:"render",value:function(){var e=y();if(!e.lastUpdate)return l.a.createElement("p",null,"Loading");var a=e.gameDates.map(function(e,a){return l.a.createElement(A,{key:a,games:e.games})});return l.a.createElement("div",{className:"App"},l.a.createElement(j,{lastUpdate:e.lastUpdate}),l.a.createElement("div",{className:"anchers"},l.a.createElement(P,{gameDates:e.gameDates,currentSection:e.currentSection})),a.filter(function(a,t){return e.currentSection==="games-"+t})[0],"ranking"===e.currentSection&&l.a.createElement(N,null),"fav"===e.currentSection&&l.a.createElement("div",{className:"fav-teams-container"},l.a.createElement("h4",{style:{margin:"10px 0"}},"Fav Teams"),l.a.createElement(G,null)),l.a.createElement(C,null),l.a.createElement(T,{video:e.videoPlaying}))}}]),a}(n.Component);c.a.render(l.a.createElement(B,null),document.getElementById("root"))}},[[23,2,1]]]);
//# sourceMappingURL=main.447f8b82.chunk.js.map