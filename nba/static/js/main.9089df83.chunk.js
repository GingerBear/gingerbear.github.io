(window.webpackJsonp=window.webpackJsonp||[]).push([[0],[,,,,,,,,,,,,,function(e,a,n){e.exports=n(39)},,,,,function(e,a,n){},,function(e,a,n){},,,,,function(e,a,n){},,function(e,a,n){},,function(e,a,n){},,function(e,a,n){},,function(e,a,n){},,function(e,a,n){},,function(e,a,n){},,function(e,a,n){"use strict";n.r(a);var t=n(0),r=n.n(t),c=n(5),l=n.n(c),i=(n(18),n(1)),o=n(3),s=(n(20),n(6)),m=n.n(s),u="nbaDailyfavTeams2";function d(e,a){return m()(e,a).tz("America/New_York")}n(25);var f=function(e){var a=d(e.lastUpdate).fromNow();return r.a.createElement("header",{id:"header"},r.a.createElement("h1",null,"NBA Daily"),r.a.createElement("button",{onClick:e.onUpdate,className:"LastUpdate"},"updated ",a))};n(27);var p=function(e){return r.a.createElement("footer",null,r.a.createElement("br",null),r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement("a",{style:{paddingBottom:10,textDecoration:"none",color:"#555",display:"block",textAlign:"right"},href:"https://github.com/gingerbear/nba-daily"},"Github"))))},v=n(10);n(29);function g(e,a){return function(){e.favTeams&&e.favTeams.indexOf(a.teamCode)>-1?e.onFavChange(e.favTeams.filter(function(e){return e!==a.teamCode})):e.onFavChange(Object(v.a)(e.favTeams).concat([a.teamCode]))}}var E=function(e){return r.a.createElement("div",{className:"Ranking",id:"ranking"},r.a.createElement("div",{className:"Ranking-body"},r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement("span",{className:"rank"}),"West"),e.rankings.west.map(function(a,n){return r.a.createElement("li",{className:"rank-".concat(n," ").concat(e.favTeams.indexOf(a.teamCode)>-1?"fav":""),key:n,onClick:g(e,a)},r.a.createElement("span",{className:"rank"},n+1),r.a.createElement("img",{src:"images/".concat(a.teamCode.toLowerCase(),".gif"),alt:a.teamCode}),r.a.createElement("span",{className:"team-name"},a.teamCode),r.a.createElement("span",{className:"win-record"},"(",a.win,"-",a.loss,")"),r.a.createElement("span",{className:"behind"},"+",a.behind))})),r.a.createElement("ul",null,r.a.createElement("li",null,"East"),e.rankings.east.map(function(a,n){return r.a.createElement("li",{className:"rank-".concat(n," ").concat(e.favTeams.indexOf(a.teamCode)>-1?"fav":""),key:n,onClick:g(e,a)},r.a.createElement("img",{src:"images/".concat(a.teamCode.toLowerCase(),".gif"),alt:a.teamCode}),r.a.createElement("span",{className:"team-name"},a.teamCode),r.a.createElement("span",{className:"win-record"},"(",a.win,"-",a.loss,")"),r.a.createElement("span",{className:"behind"},"+",a.behind))}))))},y=n(7),h=n(8),k=n(11),N=n(9),b=n(12),C=(n(31),function(e){function a(e){var n;return Object(y.a)(this,a),(n=Object(k.a)(this,Object(N.a)(a).call(this,e))).playVideo=function(e){n.videoPlayer=document.createElement("video"),n.videoPlayer.src=n.props.videos[e],n.videoPlayer.controls=!0,n.videoPlayer.addEventListener("ended",n.onVideoEnded,!1),n.videoPlayer.play(),n.refs.videoContainer.innerHTML="",n.refs.videoContainer.appendChild(n.videoPlayer)},n.onVideoEnded=function(e){var a=n.state.currentPlaying+1;a+1>n.props.videos.length||(n.setState({currentPlaying:a}),n.playVideo(a))},n.playFromStart=function(){n.setState({currentPlaying:0}),n.playVideo(n.state.currentPlaying)},n.playPrev=function(){var e=n.state.currentPlaying-1;e<0||(n.setState({currentPlaying:e}),n.playVideo(e))},n.playNext=function(){var e=n.state.currentPlaying+1;e+1>n.props.videos.length||(n.setState({currentPlaying:e}),n.playVideo(e))},n.state={currentPlaying:0},n}return Object(b.a)(a,e),Object(h.a)(a,[{key:"componentWillReceiveProps",value:function(e){e.videos?e.videos.join("")!==this.props.videos.join("")&&this.playFromStart():this.refs.videoContainer.innerHTML=""}},{key:"componentDidMount",value:function(){this.playFromStart()}},{key:"render",value:function(){return r.a.createElement("div",{className:"video-play-section"},this.props.videos.length>1&&r.a.createElement("div",{className:"playing-progress",style:{textAlign:"center"}},this.state.currentPlaying+1,"/",this.props.videos.length),r.a.createElement("div",{ref:"videoContainer",className:"videoContainer"}),this.props.videos.length>1&&r.a.createElement("div",{className:"player-buttons"},r.a.createElement("button",{disabled:0===this.state.currentPlaying,onClick:this.playPrev,className:"prev-button"},"prev"),r.a.createElement("button",{disabled:this.state.currentPlaying===this.props.videos.length-1,onClick:this.playNext,className:"next-button"},"next")))}}]),a}(t.Component));n(33);var w=function(e){return r.a.createElement("ul",{className:"PageAnchers"},e.gameDates.map(function(a,n){var t=d(new Date(+a.timestamp)).calendar().split("at")[0].trim();return r.a.createElement("li",{key:n},"games-".concat(n)===e.currentSection?r.a.createElement("span",null,t):r.a.createElement("a",{href:"#games-".concat(n)},t))}),r.a.createElement("li",null,"ranking"===e.currentSection?r.a.createElement("span",null,"Ranking"):r.a.createElement("a",{href:"#ranking"},"Ranking")))},T=n(2),P=n.n(T),j="https://dl.dropboxusercontent.com/s/kcwrqyr8455lsq6/nba-daily.json";function O(){return fetch(j,{method:"GET",headers:{Accept:"application/json","Content-Type":"application/json"},credentials:"same-origin"}).then(function(e){return e.json()})}n(35);var x=function(e){return r.a.createElement("div",{className:"TeamIcon"},function(a){var n=null,t=null;return e.rankings.east.find(function(e){return e.teamCode===a})?(t="e",n=e.rankings.east.findIndex(function(e){return e.teamCode===a})):(t="w",n=e.rankings.west.findIndex(function(e){return e.teamCode===a})),r.a.createElement("span",{className:"conf-".concat(t)},n+1)}(e.teamInfo.triCode),r.a.createElement("img",{src:"images/".concat(e.teamInfo.triCode.toLowerCase(),".gif"),alt:e.teamInfo.triCode}))};n(37);var S=function(e){var a=e.game,n=d(a.startTimeUTC).format("LT"),t=a.period.current<4&&a.period.current>0||""!==a.clock||a.period.isEndOfPeriod||a.period.isHalftime,c=!t&&0!==+a.hTeam.score&&0!==+a.vTeam.score,l=+a.hTeam.score>+a.vTeam.score,i=c&&l?"score win":"score",o=c?l?"score":"score win":"score",s=t?r.a.createElement("span",{className:"GameBadge"},"playing Q",a.period.current,"..."):null,m="GameItem fav-level-".concat(e.favLevel),u=(a.watch.broadcast.broadcasters.national||[]).map(function(e){return e.shortName}).join(""),f=[a.playoffs&&a.playoffs.seriesSummaryText||"",a.nugget.text?a.nugget.text:u].filter(Boolean).join(" | ");return r.a.createElement("div",{className:m},r.a.createElement("div",{className:"GameDate"},n," ",s,f?r.a.createElement("p",null,f):null),r.a.createElement("div",{className:"line"},r.a.createElement("div",{className:"GameSide"},r.a.createElement(x,{rankings:e.rankings,teamInfo:a.hTeam}),r.a.createElement("span",{className:i},a.hTeam.score)),r.a.createElement("div",{className:"GameSide"},r.a.createElement("span",{className:o},a.vTeam.score),r.a.createElement(x,{rankings:e.rankings,teamInfo:a.vTeam})),r.a.createElement("div",{className:"GameRecap"},a.recapLink?r.a.createElement("a",{className:"PlayButton",onClick:function(a){a.preventDefault(),e.onPlay(a.target.href)},href:a.recapLink},r.a.createElement("span",{className:"PlayIcon"})):null)))};var L=function(){var e=Object(t.useState)(function(){var e;try{e=JSON.parse(localStorage.getItem(u))||[]}catch(a){e=[]}return{rankings:{},lastUpdate:null,gameDates:[],favTeams:e}}()),a=Object(o.a)(e,2),n=a[0],c=a[1],l=Object(t.useState)(g()),s=Object(o.a)(l,2),m=s[0],d=s[1];function v(){O().then(function(e){c(Object(i.a)({},n,e))})}function g(){return(window.location.hash||"").replace("#","")||"games-".concat(function(){var e=P()().hour();return e>=0&&e<=12?0:1}())}function y(e){window.location.href="#player",c(Object(i.a)({},n,{playingVideos:[e]}))}return Object(t.useEffect)(function(){v(),window.onhashchange=function(){return d(g())}},[]),n.lastUpdate?"player"===m?n.playingVideos?r.a.createElement(C,{videos:n.playingVideos}):window.location.href="#":r.a.createElement("div",{className:"App"},r.a.createElement(f,{lastUpdate:n.lastUpdate,onUpdate:v}),r.a.createElement("div",{className:"anchers"},r.a.createElement(w,{gameDates:n.gameDates,currentSection:m})),n.gameDates.map(function(e,a){return r.a.createElement("ul",{className:"game-list"},e.games.map(function(e){return e.recapLink}).filter(Boolean).length>0&&r.a.createElement("li",{className:"play-all"},r.a.createElement("a",{className:"PlayAllButton",onClick:function(e){return function(){var a=e.games.map(function(e){return e.recapLink}).filter(Boolean);c(Object(i.a)({},n,{playingVideos:a}))}}(e),href:"#player"},r.a.createElement("span",{className:"PlayIcon"})," All")),e.games.map(function(e,a){return r.a.createElement("li",{key:a},r.a.createElement(S,{game:e,rankings:n.rankings,onPlay:y,favLevel:(t=n.favTeams,c=[e.hTeam,e.vTeam],(t.indexOf(c[0].triCode)>-1?1:0)+(t.indexOf(c[1].triCode)>-1?1:0))}));var t,c}))}).find(function(e,a){return m==="games-"+a}),"ranking"===m&&r.a.createElement(E,{rankings:n.rankings,favTeams:n.favTeams,onFavChange:function(e){localStorage.setItem(u,JSON.stringify(e)),c(Object(i.a)({},n,{favTeams:e}))}}),r.a.createElement(p,null)):r.a.createElement("p",null,"Loading")};l.a.render(r.a.createElement(L,null),document.getElementById("root"))}],[[13,2,1]]]);
//# sourceMappingURL=main.9089df83.chunk.js.map