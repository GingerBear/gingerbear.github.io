(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{25:function(e,a,n){e.exports=n(61)},30:function(e,a,n){},32:function(e,a,n){},37:function(e,a,n){},39:function(e,a,n){},41:function(e,a,n){},43:function(e,a,n){},45:function(e,a,n){},57:function(e,a,n){},59:function(e,a,n){},61:function(e,a,n){"use strict";n.r(a);var t=n(0),l=n.n(t),r=n(3),i=n.n(r),c=(n(30),n(4)),s=n(7),o=(n(32),n(14)),m=n.n(o),u="nbaDailyfavTeams";function d(e,a){return m()(e,a).tz("America/New_York")}n(37);var v=function(e){var a=d(e.lastUpdate).fromNow();return l.a.createElement("header",{id:"header"},l.a.createElement("h1",null,"NBA Daily"),l.a.createElement("button",{onClick:e.onUpdate,className:"LastUpdate"},"updated ",a))};n(39);var p=function(e){return l.a.createElement("footer",null,l.a.createElement("br",null),l.a.createElement("ul",null,l.a.createElement("li",null,l.a.createElement("a",{style:{paddingBottom:10,textDecoration:"none",color:"#555",display:"block",textAlign:"right"},href:"https://github.com/gingerbear/nba-daily"},"Github"))))};n(41);var f=function(e){return l.a.createElement("div",{className:"Ranking",id:"ranking"},l.a.createElement("div",{className:"Ranking-body"},l.a.createElement("ul",null,l.a.createElement("li",null,l.a.createElement("span",{className:"rank"}),"West"),e.rankings.west.map(function(e,a){return l.a.createElement("li",{className:"rank-".concat(a),key:a},l.a.createElement("span",{className:"rank"},a+1),l.a.createElement("img",{src:"assets/images/".concat(e.teamCode.toLowerCase(),".gif"),alt:e.teamCode}),l.a.createElement("span",{className:"team-name"},e.teamCode),l.a.createElement("span",{className:"win-record"},"(",e.win,"-",e.loss,")"),l.a.createElement("span",{className:"behind"},"+",e.behind))})),l.a.createElement("ul",null,l.a.createElement("li",null,"East"),e.rankings.east.map(function(e,a){return l.a.createElement("li",{className:"rank-".concat(a),key:a},l.a.createElement("img",{src:"assets/images/".concat(e.teamCode.toLowerCase(),".gif"),alt:e.teamCode}),l.a.createElement("span",{className:"team-name"},e.teamCode),l.a.createElement("span",{className:"win-record"},"(",e.win,"-",e.loss,")"),l.a.createElement("span",{className:"behind"},"+",e.behind))}))))},g=n(15),E=n(16),h=n(22),y=n(17),b=n(23),k=(n(43),function(e){function a(e){var n;return Object(g.a)(this,a),(n=Object(h.a)(this,Object(y.a)(a).call(this,e))).playVideo=function(e){n.videoPlayer=document.createElement("video"),n.videoPlayer.src=n.props.videos[e],n.videoPlayer.controls=!0,n.videoPlayer.addEventListener("ended",n.onVideoEnded,!1),n.videoPlayer.play(),n.refs.videoContainer.innerHTML="",n.refs.videoContainer.appendChild(n.videoPlayer)},n.onVideoEnded=function(e){var a=n.state.currentPlaying+1;a+1>n.props.videos.length||(n.setState({currentPlaying:a}),n.playVideo(a))},n.playFromStart=function(){n.setState({currentPlaying:0}),n.playVideo(n.state.currentPlaying)},n.playPrev=function(){var e=n.state.currentPlaying-1;e<0||(n.setState({currentPlaying:e}),n.playVideo(e))},n.playNext=function(){var e=n.state.currentPlaying+1;e+1>n.props.videos.length||(n.setState({currentPlaying:e}),n.playVideo(e))},n.state={currentPlaying:0},n}return Object(b.a)(a,e),Object(E.a)(a,[{key:"componentWillReceiveProps",value:function(e){e.videos?e.videos.join("")!==this.props.videos.join("")&&this.playFromStart():this.refs.videoContainer.innerHTML=""}},{key:"componentDidMount",value:function(){this.playFromStart()}},{key:"render",value:function(){return l.a.createElement("div",{className:"video-play-section"},this.props.videos.length>1&&l.a.createElement("div",{className:"playing-progress",style:{textAlign:"center"}},this.state.currentPlaying+1,"/",this.props.videos.length),l.a.createElement("div",{ref:"videoContainer",className:"videoContainer"}),this.props.videos.length>1&&l.a.createElement("div",{className:"player-buttons"},l.a.createElement("button",{disabled:0===this.state.currentPlaying,onClick:this.playPrev,className:"prev-button"},"prev"),l.a.createElement("button",{disabled:this.state.currentPlaying===this.props.videos.length-1,onClick:this.playNext,className:"next-button"},"next")))}}]),a}(t.Component));n(45);var N=function(e){return l.a.createElement("ul",{className:"PageAnchers"},e.gameDates.map(function(a,n){var t=d(new Date(+a.timestamp)).calendar().split("at")[0].trim();return l.a.createElement("li",{key:n},"games-".concat(n)===e.currentSection?l.a.createElement("span",null,t):l.a.createElement("a",{href:"#games-".concat(n)},t))}),l.a.createElement("li",null,"ranking"===e.currentSection?l.a.createElement("span",null,"Ranking"):l.a.createElement("a",{href:"#ranking"},"Ranking")),l.a.createElement("li",null,"fav"===e.currentSection?l.a.createElement("span",null,"Fav"):l.a.createElement("a",{href:"#fav"},"Fav")))},C=n(5),w=n.n(C),P="https://dl.dropboxusercontent.com/s/kcwrqyr8455lsq6/nba-daily.json";function T(){return fetch(P,{method:"GET",headers:{Accept:"application/json","Content-Type":"application/json"},credentials:"same-origin"}).then(function(e){return e.json()})}var S=n(24),O=[{value:"atl",label:"Atlanta Hawks"},{value:"bkn",label:"Brooklyn Nets"},{value:"bos",label:"Boston Celtics"},{value:"cha",label:"Charlotte Hornets"},{value:"chi",label:"Chicago Bulls"},{value:"cle",label:"Cleveland Cavaliers"},{value:"dal",label:"Dallas Mavericks"},{value:"den",label:"Denver Nuggets"},{value:"det",label:"Detroit Pistons"},{value:"gsw",label:"Golden State Warriors"},{value:"hou",label:"Houston Rockets"},{value:"ind",label:"Indiana Pacers"},{value:"lac",label:"Los Angeles Clippers"},{value:"lal",label:"Los Angeles Lakers"},{value:"mem",label:"Memphis Grizzlies"},{value:"mia",label:"Miami Heat"},{value:"mil",label:"Milwaukee Bucks"},{value:"min",label:"Minnesota Timberwolves"},{value:"nop",label:"New Orleans Pelicans"},{value:"nyk",label:"New York Knicks"},{value:"okc",label:"Oklahoma City Thunder"},{value:"orl",label:"Orlando Magic"},{value:"phi",label:"Philadelphia 76ers"},{value:"phx",label:"Phoenix Suns"},{value:"por",label:"Portland Trail Blazers"},{value:"sac",label:"Sacramento Kings"},{value:"sas",label:"San Antonio Spurs"},{value:"tor",label:"Toronto Raptors"},{value:"uta",label:"Utah Jazz"},{value:"was",label:"Washington Wizards"}];var j=function(e){return l.a.createElement(S.a,{name:"fav-teams",isMulti:!0,closeMenuOnSelect:!1,value:e.favTeams,options:O,onChange:e.onChange})};n(57);var L=function(e){return l.a.createElement("div",{className:"TeamIcon"},function(a){var n=null,t=null;return e.rankings.east.find(function(e){return e.teamCode===a})?(t="e",n=e.rankings.east.findIndex(function(e){return e.teamCode===a})):(t="w",n=e.rankings.west.findIndex(function(e){return e.teamCode===a})),l.a.createElement("span",{className:"conf-".concat(t)},n+1)}(e.teamInfo.triCode),l.a.createElement("img",{src:"assets/images/".concat(e.teamInfo.triCode.toLowerCase(),".gif"),alt:e.teamInfo.triCode}))};n(59);var x=function(e){var a=e.game,n=d(a.startTimeUTC).format("LT"),t=a.period.current<4&&a.period.current>0||""!==a.clock||a.period.isEndOfPeriod||a.period.isHalftime,r=!t&&0!==+a.hTeam.score&&0!==+a.vTeam.score,i=+a.hTeam.score>+a.vTeam.score,c=r&&i?"score win":"score",s=r?i?"score":"score win":"score",o=t?l.a.createElement("span",{className:"GameBadge"},"playing Q",a.period.current,"..."):null,m="GameItem fav-level-".concat(e.favLevel),u=(a.watch.broadcast.broadcasters.national||[]).map(function(e){return e.shortName}).join(""),v=[a.playoffs&&a.playoffs.seriesSummaryText||"",a.nugget.text?a.nugget.text:u].filter(Boolean).join(" | ");return l.a.createElement("div",{className:m},l.a.createElement("div",{className:"GameDate"},n," ",o,v?l.a.createElement("p",null,v):null),l.a.createElement("div",{className:"line"},l.a.createElement("div",{className:"GameSide"},l.a.createElement(L,{rankings:e.rankings,teamInfo:a.hTeam}),l.a.createElement("span",{className:c},a.hTeam.score)),l.a.createElement("div",{className:"GameSide"},l.a.createElement("span",{className:s},a.vTeam.score),l.a.createElement(L,{rankings:e.rankings,teamInfo:a.vTeam})),l.a.createElement("div",{className:"GameRecap"},a.recapLink?l.a.createElement("a",{className:"PlayButton",onClick:function(a){a.preventDefault(),e.onPlay(a.target.href)},href:a.recapLink},l.a.createElement("span",{className:"PlayIcon"})):null)))};var D=function(){var e=Object(t.useState)(function(){var e;try{e=JSON.parse(localStorage.getItem(u))||[]}catch(a){e=[]}return{rankings:{},lastUpdate:null,gameDates:[],favTeams:e}}()),a=Object(s.a)(e,2),n=a[0],r=a[1],i=Object(t.useState)(E()),o=Object(s.a)(i,2),m=o[0],d=o[1];function g(){T().then(function(e){r(Object(c.a)({},n,e))})}function E(){return(window.location.hash||"").replace("#","")||"games-".concat(function(){var e=w()().hour();return e>=0&&e<=12?0:1}())}function h(e){window.location.href="#player",r(Object(c.a)({},n,{playingVideos:[e]}))}return Object(t.useEffect)(function(){g(),window.onhashchange=function(){return d(E())}},[]),n.lastUpdate?"player"===m?n.playingVideos?l.a.createElement(k,{videos:n.playingVideos}):window.location.href="#":l.a.createElement("div",{className:"App"},l.a.createElement(v,{lastUpdate:n.lastUpdate,onUpdate:g}),l.a.createElement("div",{className:"anchers"},l.a.createElement(N,{gameDates:n.gameDates,currentSection:m})),n.gameDates.map(function(e,a){return l.a.createElement("ul",{className:"game-list"},e.games.map(function(e){return e.recapLink}).filter(Boolean).length>0&&l.a.createElement("li",{className:"play-all"},l.a.createElement("a",{className:"PlayAllButton",onClick:function(e){return function(){var a=e.games.map(function(e){return e.recapLink}).filter(Boolean);r(Object(c.a)({},n,{playingVideos:a}))}}(e),href:"#player"},l.a.createElement("span",{className:"PlayIcon"})," All")),e.games.map(function(e,a){return l.a.createElement("li",{key:a},l.a.createElement(x,{game:e,rankings:n.rankings,onPlay:h,favLevel:function(e,a){var n=e.map(function(e){return e.value});return(n.indexOf(a[0].triCode.toLowerCase())>-1?1:0)+(n.indexOf(a[1].triCode.toLowerCase())>-1?1:0)}(n.favTeams,[e.hTeam,e.vTeam])}))}))}).find(function(e,a){return m==="games-"+a}),"ranking"===m&&l.a.createElement(f,{rankings:n.rankings}),"fav"===m&&l.a.createElement("div",{className:"fav-teams-container"},l.a.createElement("h4",{style:{margin:"10px 0"}},"Fav Teams"),l.a.createElement(j,{favTeams:n.favTeams,onChange:function(e){localStorage.setItem(u,JSON.stringify(e)),r(Object(c.a)({},n,{favTeams:e}))}})),l.a.createElement(p,null)):l.a.createElement("p",null,"Loading")};i.a.render(l.a.createElement(D,null),document.getElementById("root"))}},[[25,2,1]]]);
//# sourceMappingURL=main.d9d84b0c.chunk.js.map