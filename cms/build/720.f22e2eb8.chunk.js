"use strict";(self.webpackChunkprojectdes_cms=self.webpackChunkprojectdes_cms||[]).push([[720],{40216:(dt,S,s)=>{s.d(S,{S:()=>N});var t=s(92132),_=s(63891),P=s(94061),G=s(48653),F=s(83997),X=s(30893);const w=(0,_.default)(P.a)`
  height: ${24/16}rem;
  width: ${24/16}rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    height: ${10/16}rem;
    width: ${10/16}rem;
  }

  svg path {
    fill: ${({theme:C})=>C.colors.primary600};
  }
`,m=(0,_.default)(P.a)`
  border-radius: 0 0 ${({theme:C})=>C.borderRadius} ${({theme:C})=>C.borderRadius};
  display: block;
  width: 100%;
  border: none;
`,N=({children:C,icon:z,...I})=>(0,t.jsxs)("div",{children:[(0,t.jsx)(G.c,{}),(0,t.jsx)(m,{as:"button",background:"primary100",padding:5,...I,children:(0,t.jsxs)(F.s,{children:[(0,t.jsx)(w,{"aria-hidden":!0,background:"primary200",children:z}),(0,t.jsx)(P.a,{paddingLeft:3,children:(0,t.jsx)(X.o,{variant:"pi",fontWeight:"bold",textColor:"primary600",children:C})})]})})]})},90720:(dt,S,s)=>{s.r(S),s.d(S,{default:()=>Nt});var t=s(92132),_=s(94061),P=s(85963),G=s(58805),F=s(88353),X=s(4198),w=s(55356),m=s(83997),N=s(35513),C=s(26127),z=s(90361),I=s(33363),ct=s(40216),f=s(30893),d=s(21247),ht=s(46270),_t=s(54514),pt=s(68802),ut=s(77701),gt=s(41231),J=s(41909),W=s(5194),mt=s(50612),j=s(2600),ft=s(412),Y=s(56336),q=s(39404),R=s(54894),H=s(17703),L=s(21272),r=s(34455),E=s(63891),kt=s(14718),Zt=s(48147),Vt=s(48940),Gt=s(77160),Xt=s(21835),wt=s(17024),Ht=s(51187),Qt=s(12083),Jt=s(94710),Yt=s(14311),qt=s(82437),te=s(89102),ee=s(5409),se=s(35336),ne=s(71547),oe=s(58692),ae=s(71210),ie=s(5790),le=s(35223),re=s(45635);const Et=(0,E.default)(_.a)`
  table {
    width: 100%;
    white-space: nowrap;
  }

  thead {
    border-bottom: 1px solid ${({theme:e})=>e.colors.neutral150};

    tr {
      border-top: 0;
    }
  }

  tr {
    border-top: 1px solid ${({theme:e})=>e.colors.neutral150};

    & td,
    & th {
      padding: ${({theme:e})=>e.spaces[4]};
    }

    & td:first-of-type,
    & th:first-of-type {
      padding: 0 ${({theme:e})=>e.spaces[1]};
    }
  }

  th,
  td {
    vertical-align: middle;
    text-align: left;
    color: ${({theme:e})=>e.colors.neutral600};
    outline-offset: -4px;
  }
`,tt=E.default.tr`
  &.component-row,
  &.dynamiczone-row {
    position: relative;
    border-top: none !important;

    table tr:first-child {
      border-top: none;
    }

    > td:first-of-type {
      padding: 0 0 0 ${(0,d.a8)(20)};
      position: relative;

      &::before {
        content: '';
        width: ${(0,d.a8)(4)};
        height: calc(100% - 40px);
        position: absolute;
        top: -7px;
        left: 1.625rem;
        border-radius: 4px;

        ${({isFromDynamicZone:e,isChildOfDynamicZone:n,theme:o})=>n?`background-color: ${o.colors.primary200};`:e?`background-color: ${o.colors.primary200};`:`background: ${o.colors.neutral150};`}
      }
    }
  }

  &.dynamiczone-row > td:first-of-type {
    padding: 0;
  }
`,et=({customRowComponent:e,component:n,isFromDynamicZone:o=!1,isNestedInDZComponent:a=!1,firstLoopComponentUid:c})=>{const{modifiedData:l}=(0,r.u)(),{schema:{attributes:p}}=j(l,["components",n],{schema:{attributes:[]}});return(0,t.jsx)(tt,{isChildOfDynamicZone:o,className:"component-row",children:(0,t.jsx)("td",{colSpan:12,children:(0,t.jsx)(nt,{customRowComponent:e,items:p,targetUid:n,firstLoopComponentUid:c||n,editTarget:"components",isFromDynamicZone:o,isNestedInDZComponent:a,isSub:!0,secondLoopComponentUid:c?n:null})})})},xt=({isActive:e=!1,icon:n="cube"})=>(0,t.jsx)(m.s,{alignItems:"center",background:e?"primary200":"neutral200",justifyContent:"center",height:8,width:8,borderRadius:"50%",children:(0,t.jsx)(G.I,{as:r.C[n]||r.C.cube,height:5,width:5})}),st=(0,E.default)(_.a)`
  position: absolute;
  display: none;
  top: 5px;
  right: ${(0,d.a8)(8)};

  svg {
    width: ${(0,d.a8)(10)};
    height: ${(0,d.a8)(10)};

    path {
      fill: ${({theme:e})=>e.colors.primary600};
    }
  }
`,Mt=(0,E.default)(m.s)`
  width: ${(0,d.a8)(140)};
  height: ${(0,d.a8)(80)};
  position: relative;
  border: 1px solid ${({theme:e})=>e.colors.neutral200};
  background: ${({theme:e})=>e.colors.neutral100};
  border-radius: ${({theme:e})=>e.borderRadius};
  max-width: 100%;

  &.active,
  &:focus,
  &:hover {
    border: 1px solid ${({theme:e})=>e.colors.primary200};
    background: ${({theme:e})=>e.colors.primary100};

    ${st} {
      display: block;
    }

    ${f.o} {
      color: ${({theme:e})=>e.colors.primary600};
    }

    /* > ComponentIcon */
    > div:first-child {
      background: ${({theme:e})=>e.colors.primary200};
      color: ${({theme:e})=>e.colors.primary600};

      svg {
        path {
          fill: ${({theme:e})=>e.colors.primary600};
        }
      }
    }
  }
`,yt=({component:e,dzName:n,index:o,isActive:a=!1,isInDevelopmentMode:c=!1,onClick:l})=>{const{modifiedData:p,removeComponentFromDynamicZone:D}=(0,r.u)(),{schema:{icon:M,displayName:x}}=j(p,["components",e],{schema:{}}),u=i=>{i.stopPropagation(),D(n,o)};return(0,t.jsxs)(Mt,{alignItems:"center",direction:"column",className:a?"active":"",borderRadius:"borderRadius",justifyContent:"center",paddingLeft:4,paddingRight:4,shrink:0,onClick:l,role:"tab",tabIndex:a?0:-1,cursor:"pointer","aria-selected":a,"aria-controls":`dz-${n}-panel-${o}`,id:`dz-${n}-tab-${o}`,children:[(0,t.jsx)(xt,{icon:M,isActive:a}),(0,t.jsx)(_.a,{marginTop:1,maxWidth:"100%",children:(0,t.jsx)(f.o,{variant:"pi",fontWeight:"bold",ellipsis:!0,children:x})}),c&&(0,t.jsx)(st,{as:"button",onClick:u,children:(0,t.jsx)(pt.A,{})})]})},jt=(0,E.default)(W.A)`
  width: ${(0,d.a8)(32)};
  height: ${(0,d.a8)(32)};
  padding: ${(0,d.a8)(9)};
  border-radius: ${(0,d.a8)(64)};
  background: ${({theme:e})=>e.colors.primary100};
  path {
    fill: ${({theme:e})=>e.colors.primary600};
  }
`,Dt=(0,E.default)(_.a)`
  height: ${(0,d.a8)(90)};
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
`,Ct=(0,E.default)(m.s)`
  width: 100%;
  overflow-x: auto;
`,Ot=(0,E.default)(_.a)`
  padding-top: ${(0,d.a8)(90)};
`,Pt=(0,E.default)(m.s)`
  flex-shrink: 0;
  width: ${(0,d.a8)(140)};
  height: ${(0,d.a8)(80)};
  justify-content: center;
  align-items: center;
`,Tt=({customRowComponent:e,components:n=[],addComponent:o,name:a,targetUid:c})=>{const{isInDevelopmentMode:l}=(0,r.u)(),[p,D]=(0,L.useState)(0),{formatMessage:M}=(0,R.A)(),x=i=>{p!==i&&D(i)},u=()=>{o(a)};return(0,t.jsx)(tt,{className:"dynamiczone-row",isFromDynamicZone:!0,children:(0,t.jsxs)("td",{colSpan:12,children:[(0,t.jsx)(Dt,{paddingLeft:8,children:(0,t.jsxs)(Ct,{gap:2,children:[l&&(0,t.jsx)("button",{type:"button",onClick:u,children:(0,t.jsxs)(Pt,{direction:"column",alignItems:"stretch",gap:1,children:[(0,t.jsx)(jt,{}),(0,t.jsx)(f.o,{variant:"pi",fontWeight:"bold",textColor:"primary600",children:M({id:(0,r.g)("button.component.add"),defaultMessage:"Add a component"})})]})}),(0,t.jsx)(m.s,{role:"tablist",gap:2,children:n.map((i,h)=>(0,t.jsx)(yt,{dzName:a||"",index:h,component:i,isActive:p===h,isInDevelopmentMode:l,onClick:()=>x(h)},i))})]})}),(0,t.jsx)(Ot,{children:n.map((i,h)=>{const g={customRowComponent:e,component:i};return(0,t.jsx)(_.a,{id:`dz-${a}-panel-${h}`,role:"tabpanel","aria-labelledby":`dz-${a}-tab-${h}`,style:{display:p===h?"block":"none"},children:(0,t.jsx)("table",{children:(0,t.jsx)("tbody",{children:(0,L.createElement)(et,{...g,isFromDynamicZone:!0,component:c,key:i})})})},i)})})]})})},vt=(0,E.default)(_.a)`
  height: ${24/16}rem;
  width: ${24/16}rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    height: ${10/16}rem;
    width: ${10/16}rem;
  }

  svg path {
    fill: ${({theme:e,color:n})=>e.colors[`${n}600`]};
  }
`,At=(0,E.default)(_.a)`
  border-radius: 0 0 ${({theme:e})=>e.borderRadius} ${({theme:e})=>e.borderRadius};
  display: block;
  width: 100%;
  border: none;
  position: relative;
  left: -0.25rem;
`,bt=({children:e,icon:n,color:o,...a})=>(0,t.jsx)(At,{paddingBottom:4,paddingTop:4,as:"button",type:"button",...a,children:(0,t.jsxs)(m.s,{children:[(0,t.jsx)(vt,{color:o,"aria-hidden":!0,background:`${o}200`,children:n}),(0,t.jsx)(_.a,{paddingLeft:3,children:(0,t.jsx)(f.o,{variant:"pi",fontWeight:"bold",textColor:`${o}600`,children:e})})]})}),nt=({addComponentToDZ:e,customRowComponent:n,editTarget:o,firstLoopComponentUid:a,isFromDynamicZone:c=!1,isMain:l=!1,isNestedInDZComponent:p=!1,isSub:D=!1,items:M=[],secondLoopComponentUid:x,targetUid:u})=>{const{formatMessage:i}=(0,R.A)(),{trackUsage:h}=(0,d.z1)(),{isInDevelopmentMode:g,modifiedData:B,isInContentTypeView:T}=(0,r.u)(),{onOpenModalAddField:A}=(0,r.a)(),O=()=>{h("hasClickedCTBAddFieldBanner"),A({forTarget:o,targetUid:u})};return u?M.length===0&&l?(0,t.jsxs)(N.X,{colCount:2,rowCount:2,children:[(0,t.jsx)(C.d,{children:(0,t.jsxs)(z.Tr,{children:[(0,t.jsx)(I.Th,{children:(0,t.jsx)(f.o,{variant:"sigma",textColor:"neutral600",children:i({id:"global.name",defaultMessage:"Name"})})}),(0,t.jsx)(I.Th,{children:(0,t.jsx)(f.o,{variant:"sigma",textColor:"neutral600",children:i({id:"global.type",defaultMessage:"Type"})})})]})}),(0,t.jsx)(d.m5,{action:(0,t.jsx)(P.$,{onClick:O,size:"L",startIcon:(0,t.jsx)(W.A,{}),variant:"secondary",children:i({id:(0,r.g)("table.button.no-fields"),defaultMessage:"Add new field"})}),colSpan:2,content:T?{id:(0,r.g)("table.content.no-fields.collection-type"),defaultMessage:"Add your first field to this Collection-Type"}:{id:(0,r.g)("table.content.no-fields.component"),defaultMessage:"Add your first field to this component"}})]}):(0,t.jsxs)(Et,{children:[(0,t.jsx)(_.a,{paddingLeft:6,paddingRight:l?6:0,...l&&{style:{overflowX:"auto"}},children:(0,t.jsxs)("table",{children:[l&&(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{children:(0,t.jsx)(f.o,{variant:"sigma",textColor:"neutral600",children:i({id:"global.name",defaultMessage:"Name"})})}),(0,t.jsx)("th",{colSpan:2,children:(0,t.jsx)(f.o,{variant:"sigma",textColor:"neutral600",children:i({id:"global.type",defaultMessage:"Type"})})})]})}),(0,t.jsx)("tbody",{children:M.map(v=>{const{type:$}=v,K=n;return(0,t.jsxs)(L.Fragment,{children:[(0,t.jsx)(K,{...v,isNestedInDZComponent:p,targetUid:u,editTarget:o,firstLoopComponentUid:a,isFromDynamicZone:c,secondLoopComponentUid:x}),$==="component"&&(0,t.jsx)(et,{...v,customRowComponent:n,targetUid:u,isNestedInDZComponent:c,editTarget:o,firstLoopComponentUid:a}),$==="dynamiczone"&&(0,t.jsx)(Tt,{...v,customRowComponent:n,addComponent:e,targetUid:u})]},v.name)})})]})}),l&&g&&(0,t.jsx)(ct.S,{icon:(0,t.jsx)(W.A,{}),onClick:O,children:i({id:(0,r.g)(`form.button.add.field.to.${B.contentType?B.contentType.schema.kind:o||"collectionType"}`),defaultMessage:"Add another field"})}),D&&g&&!c&&(0,t.jsx)(bt,{icon:(0,t.jsx)(W.A,{}),onClick:O,color:c?"primary":"neutral",children:i({id:(0,r.g)("form.button.add.field.to.component"),defaultMessage:"Add another field"})})]}):(0,t.jsxs)(N.X,{colCount:2,rowCount:2,children:[(0,t.jsx)(C.d,{children:(0,t.jsxs)(z.Tr,{children:[(0,t.jsx)(I.Th,{children:(0,t.jsx)(f.o,{variant:"sigma",textColor:"neutral600",children:i({id:"global.name",defaultMessage:"Name"})})}),(0,t.jsx)(I.Th,{children:(0,t.jsx)(f.o,{variant:"sigma",textColor:"neutral600",children:i({id:"global.type",defaultMessage:"Type"})})})]})}),(0,t.jsx)(d.m5,{colSpan:2,content:{id:(0,r.g)("table.content.create-first-content-type"),defaultMessage:"Create your first Collection-Type"}})]})},Bt=(0,E.default)(_.a)`
  position: absolute;
  left: -1.125rem;
  top: 0px;

  &:before {
    content: '';
    width: ${4/16}rem;
    height: ${12/16}rem;
    background: ${({theme:e,color:n})=>e.colors[n]};
    display: block;
  }
`,$t=E.default.svg`
  position: relative;
  flex-shrink: 0;
  transform: translate(-0.5px, -1px);

  * {
    fill: ${({theme:e,color:n})=>e.colors[n]};
  }
`,It=e=>(0,t.jsx)(Bt,{children:(0,t.jsx)($t,{width:"20",height:"23",viewBox:"0 0 20 23",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:(0,t.jsx)("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7.02477 14.7513C8.65865 17.0594 11.6046 18.6059 17.5596 18.8856C18.6836 18.9384 19.5976 19.8435 19.5976 20.9688V20.9688C19.5976 22.0941 18.6841 23.0125 17.5599 22.9643C10.9409 22.6805 6.454 20.9387 3.75496 17.1258C0.937988 13.1464 0.486328 7.39309 0.486328 0.593262H4.50974C4.50974 7.54693 5.06394 11.9813 7.02477 14.7513Z"})})}),Rt=({type:e,customField:n=null,repeatable:o=!1})=>{const{formatMessage:a}=(0,R.A)();let c=e;return["integer","biginteger","float","decimal"].includes(e)?c="number":["string"].includes(e)&&(c="text"),n?(0,t.jsx)(f.o,{children:a({id:(0,r.g)("attribute.customField"),defaultMessage:"Custom field"})}):(0,t.jsxs)(f.o,{children:[a({id:(0,r.g)(`attribute.${c}`),defaultMessage:e}),"\xA0",o&&a({id:(0,r.g)("component.repeatable"),defaultMessage:"(repeatable)"})]})},Wt=({content:e})=>(0,t.jsx)(t.Fragment,{children:q(e)}),Lt=(0,E.default)(_.a)`
  position: relative;
`,Kt=(0,L.memo)(({configurable:e=!0,customField:n=null,editTarget:o,firstLoopComponentUid:a=null,isFromDynamicZone:c=!1,name:l,onClick:p,relation:D="",repeatable:M=!1,secondLoopComponentUid:x=null,target:u=null,targetUid:i=null,type:h})=>{const{contentTypes:g,isInDevelopmentMode:B,removeAttribute:T}=(0,r.u)(),{formatMessage:A}=(0,R.A)(),O=h==="relation"&&D.includes("morph"),v=["integer","biginteger","float","decimal"].includes(h)?"number":h,$=j(g,[u],{}),K=j($,["schema","displayName"],""),U=j($,"plugin"),Q=u?"relation":v,k=()=>{O||e!==!1&&p(o,x||a||i,l,h,n)};let b;return x&&a?b=2:a?b=1:b=0,(0,t.jsxs)(Lt,{as:"tr",...(0,d.qM)({fn:k,condition:B&&e&&!O}),children:[(0,t.jsxs)("td",{style:{position:"relative"},children:[b!==0&&(0,t.jsx)(It,{color:c?"primary200":"neutral150"}),(0,t.jsxs)(m.s,{paddingLeft:2,gap:4,children:[(0,t.jsx)(r.A,{type:Q,customField:n}),(0,t.jsx)(f.o,{fontWeight:"bold",children:l})]})]}),(0,t.jsx)("td",{children:u?(0,t.jsxs)(f.o,{children:[A({id:(0,r.g)(`modelPage.attribute.${O?"relation-polymorphic":"relationWith"}`),defaultMessage:"Relation with"}),"\xA0",(0,t.jsxs)("span",{style:{fontStyle:"italic"},children:[(0,t.jsx)(Wt,{content:K}),"\xA0",U&&`(${A({id:(0,r.g)("from"),defaultMessage:"from"})}: ${U})`]})]}):(0,t.jsx)(Rt,{type:h,customField:n,repeatable:M})}),(0,t.jsx)("td",{children:B?(0,t.jsx)(m.s,{justifyContent:"flex-end",...d.dG,children:e?(0,t.jsxs)(m.s,{gap:1,children:[!O&&(0,t.jsx)(F.K,{onClick:k,label:`${A({id:"app.utils.edit",defaultMessage:"Edit"})} ${l}`,noBorder:!0,icon:(0,t.jsx)(J.A,{})}),(0,t.jsx)(F.K,{onClick:Z=>{Z.stopPropagation(),T(o,l,x||a||"")},label:`${A({id:"global.delete",defaultMessage:"Delete"})} ${l}`,noBorder:!0,icon:(0,t.jsx)(mt.A,{})})]}):(0,t.jsx)(gt.A,{})}):(0,t.jsx)(_.a,{height:(0,d.a8)(32)})})]})}),Ut=e=>{let n;switch(e){case"date":case"datetime":case"time":case"timestamp":n="date";break;case"integer":case"biginteger":case"decimal":case"float":n="number";break;case"string":case"text":n="text";break;case"":n="relation";break;default:n=e}return n},St={collectionTypesConfigurations:[{action:"plugin::content-manager.collection-types.configure-view",subject:null}],componentsConfigurations:[{action:"plugin::content-manager.components.configure-layout",subject:null}],singleTypesConfigurations:[{action:"plugin::content-manager.single-types.configure-view",subject:null}]},Ft=(0,L.memo)(({disabled:e,isTemporary:n=!1,isInContentTypeView:o=!0,contentTypeKind:a="collectionType",targetUid:c=""})=>{const{formatMessage:l}=(0,R.A)(),{push:p}=(0,H.W6)(),{collectionTypesConfigurations:D,componentsConfigurations:M,singleTypesConfigurations:x}=St,u=l({id:"content-type-builder.form.button.configure-view",defaultMessage:"Configure the view"});let i=D;const h=()=>(n||p(o?`/content-manager/collection-types/${c}/configurations/edit`:`/content-manager/components/${c}/configurations/edit`),!1);return o&&a==="singleType"&&(i=x),o||(i=M),(0,t.jsx)(d.d4,{permissions:i,children:(0,t.jsx)(P.$,{startIcon:(0,t.jsx)(ut.A,{}),variant:"tertiary",onClick:h,disabled:n||e,children:u})})}),Nt=()=>{const{initialData:e,modifiedData:n,isInDevelopmentMode:o,isInContentTypeView:a,submitData:c}=(0,r.u)(),{formatMessage:l}=(0,R.A)(),{trackUsage:p}=(0,d.z1)(),D=(0,H.W5)("/plugins/content-type-builder/:kind/:currentUID"),{onOpenModalAddComponentsToDZ:M,onOpenModalAddField:x,onOpenModalEditField:u,onOpenModalEditSchema:i,onOpenModalEditCustomField:h}=(0,r.a)(),g=a?"contentType":"component",B=[g,"schema","attributes"],T=j(n,[g,"uid"]),A=j(n,[g,"isTemporary"],!1),O=j(n,[g,"schema","kind"],null),v=j(n,B,[]),$=ft(e,[g,"plugin"]),K=!Y(n,e),U=a?"contentType":"component",Q=y=>{M({dynamicZoneTarget:y,targetUid:T})},k=async(y,ot,at,it,lt)=>{const rt=Ut(it);lt?h({forTarget:y,targetUid:ot,attributeName:at,attributeType:rt,customFieldUid:lt}):u({forTarget:y,targetUid:ot,attributeName:at,attributeType:rt,step:it==="component"?"2":null})};let b=j(n,[g,"schema","displayName"],"");const Z=j(n,[g,"schema","kind"],""),V=D?.params.currentUID==="create-content-type";!b&&V&&(b=l({id:(0,r.g)("button.model.create"),defaultMessage:"Create new collection type"}));const zt=()=>{const y=Z||g;y==="collectionType"&&p("willEditNameOfContentType"),y==="singleType"&&p("willEditNameOfSingleType"),i({modalType:g,forTarget:g,targetUid:T,kind:y})};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(H.XG,{message:y=>y.hash==="#back"?!1:l({id:(0,r.g)("prompt.unsaved")}),when:K}),(0,t.jsx)(w.Q,{id:"title",primaryAction:o&&(0,t.jsxs)(m.s,{gap:2,children:[!V&&(0,t.jsx)(P.$,{startIcon:(0,t.jsx)(W.A,{}),variant:"secondary",onClick:()=>{x({forTarget:U,targetUid:T})},children:l({id:(0,r.g)("button.attributes.add.another"),defaultMessage:"Add another field"})}),(0,t.jsx)(P.$,{startIcon:(0,t.jsx)(_t.A,{}),onClick:async()=>await c(),type:"submit",disabled:Y(n,e),children:l({id:"global.save",defaultMessage:"Save"})})]}),secondaryAction:o&&!$&&!V&&(0,t.jsx)(P.$,{startIcon:(0,t.jsx)(J.A,{}),variant:"tertiary",onClick:zt,children:l({id:"app.utils.edit",defaultMessage:"Edit"})}),title:q(b),subtitle:l({id:(0,r.g)("listView.headerLayout.description"),defaultMessage:"Build the data architecture of your content"}),navigationAction:(0,t.jsx)(d.N_,{startIcon:(0,t.jsx)(ht.A,{}),to:"/plugins/content-type-builder/",children:l({id:"global.back",defaultMessage:"Back"})})}),(0,t.jsx)(X.s,{children:(0,t.jsxs)(m.s,{direction:"column",alignItems:"stretch",gap:4,children:[(0,t.jsx)(m.s,{justifyContent:"flex-end",children:(0,t.jsx)(m.s,{gap:2,children:(0,t.jsx)(Ft,{targetUid:T,isTemporary:A,isInContentTypeView:a,contentTypeKind:O,disabled:V},"link-to-cm-settings-view")})}),(0,t.jsx)(_.a,{background:"neutral0",shadow:"filterShadow",hasRadius:!0,children:(0,t.jsx)(nt,{items:v,customRowComponent:y=>(0,t.jsx)(Kt,{...y,onClick:k}),addComponentToDZ:Q,targetUid:T,editTarget:U,isMain:!0})})]})})]})}}}]);
