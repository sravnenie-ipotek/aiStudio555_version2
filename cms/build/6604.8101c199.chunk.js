"use strict";(self.webpackChunkprojectdes_cms=self.webpackChunkprojectdes_cms||[]).push([[6604],{36604:(W,P,_)=>{_.r(P),_.d(P,{FORMS:()=>U});var s=_(92132),a=_(94061),O=_(85963),C=_(48653),D=_(43064),v=_(38413),n=_(83997),d=_(30893),l=_(21610),A=_(54894),i=_(17703),M=_(71389),r=_(63891),E=_(70573),h=_(77452),B=_(21247),t=_(15126),g=_(63299),j=_(67014),x=_(59080),c=_(79275),f=_(14718),y=_(21272),S=_(82437),$=_(61535),N=_(5790),e=_(12083),u=_(35223),F=_(5409),z=_(74930),G=_(2600),J=_(48940),Z=_(41286),H=_(56336),Q=_(13426),V=_(84624),X=_(77965),Y=_(54257),p=_(71210),w=_(51187),k=_(39404),b=_(58692),q=_(501),__=_(57646),s_=_(23120),E_=_(44414),t_=_(25962),a_=_(14664),n_=_(42588),d_=_(90325),o_=_(62785),O_=_(87443),M_=_(41032),P_=_(22957),D_=_(93179),l_=_(73055),i_=_(15747),r_=_(85306),h_=_(26509),C_=_(32058),v_=_(81185),A_=_(82261);const T=()=>{const{push:I}=(0,i.W6)(),{formatMessage:o}=(0,A.A)(),{isLoading:m,data:L=[]}=(0,E.g)(void 0,{skip:!window.strapi.features.isEnabled(window.strapi.features.SSO)}),K=()=>{I("/auth/login")};return!window.strapi.features.isEnabled(window.strapi.features.SSO)||!m&&L.length===0?(0,s.jsx)(i.rd,{to:"/auth/login"}):(0,s.jsx)(E.U,{children:(0,s.jsxs)(v.g,{children:[(0,s.jsxs)(E.h,{children:[(0,s.jsxs)(E.C,{children:[(0,s.jsx)(E.i,{}),(0,s.jsx)(a.a,{paddingTop:6,paddingBottom:1,children:(0,s.jsx)(d.o,{as:"h1",variant:"alpha",children:o({id:"Auth.form.welcome.title"})})}),(0,s.jsx)(a.a,{paddingBottom:7,children:(0,s.jsx)(d.o,{variant:"epsilon",textColor:"neutral600",children:o({id:"Auth.login.sso.subtitle"})})})]}),(0,s.jsxs)(n.s,{direction:"column",alignItems:"stretch",gap:7,children:[m?(0,s.jsx)(n.s,{justifyContent:"center",children:(0,s.jsx)(D.a,{children:o({id:"Auth.login.sso.loading"})})}):(0,s.jsx)(h.S,{providers:L}),(0,s.jsxs)(n.s,{children:[(0,s.jsx)(R,{}),(0,s.jsx)(a.a,{paddingLeft:3,paddingRight:3,children:(0,s.jsx)(d.o,{variant:"sigma",textColor:"neutral600",children:o({id:"or"})})}),(0,s.jsx)(R,{})]}),(0,s.jsx)(O.$,{fullWidth:!0,size:"L",onClick:K,children:o({id:"Auth.form.button.login.strapi"})})]})]}),(0,s.jsx)(n.s,{justifyContent:"center",children:(0,s.jsx)(a.a,{paddingTop:4,children:(0,s.jsx)(l.N,{as:M.k2,to:"/auth/forgot-password",children:(0,s.jsx)(d.o,{variant:"pi",children:o({id:"Auth.link.forgot-password"})})})})})]})})},R=(0,r.default)(C.c)`
  flex: 1;
`,U={providers:T}},77452:(W,P,_)=>{_.d(P,{S:()=>A});var s=_(92132),a=_(90151),O=_(68074),C=_(83997),D=_(79739),v=_(30893),n=_(54894),d=_(71389),l=_(63891);const A=({providers:E,displayAllProviders:h})=>{const{formatMessage:B}=(0,n.A)();return h?(0,s.jsx)(a.x,{gap:4,children:E.map(t=>(0,s.jsx)(O.E,{col:4,children:(0,s.jsx)(M,{provider:t})},t.uid))}):E.length>2&&!h?(0,s.jsxs)(a.x,{gap:4,children:[E.slice(0,2).map(t=>(0,s.jsx)(O.E,{col:4,children:(0,s.jsx)(M,{provider:t})},t.uid)),(0,s.jsx)(O.E,{col:4,children:(0,s.jsx)(D.m,{label:B({id:"global.see-more"}),children:(0,s.jsx)(r,{as:d.N_,to:"/auth/providers",children:(0,s.jsx)("span",{"aria-hidden":!0,children:"\u2022\u2022\u2022"})})})})]}):(0,s.jsx)(i,{justifyContent:"center",children:E.map(t=>(0,s.jsx)(M,{provider:t},t.uid))})},i=(0,l.default)(C.s)`
  & a:not(:first-child):not(:last-child) {
    margin: 0 ${({theme:E})=>E.spaces[2]};
  }
  & a:first-child {
    margin-right: ${({theme:E})=>E.spaces[2]};
  }
  & a:last-child {
    margin-left: ${({theme:E})=>E.spaces[2]};
  }
`,M=({provider:E})=>(0,s.jsx)(D.m,{label:E.displayName,children:(0,s.jsx)(r,{href:`${window.strapi.backendURL}/admin/connect/${E.uid}`,children:E.icon?(0,s.jsx)("img",{src:E.icon,"aria-hidden":!0,alt:"",height:"32px"}):(0,s.jsx)(v.o,{children:E.displayName})})}),r=l.default.a`
  width: ${136/16}rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${48/16}rem;
  border: 1px solid ${({theme:E})=>E.colors.neutral150};
  border-radius: ${({theme:E})=>E.borderRadius};
  text-decoration: inherit;
  &:link {
    text-decoration: none;
  }
  color: ${({theme:E})=>E.colors.neutral600};
`}}]);
