import React, {useId} from 'react';
export const getUILanguage = () => 'en';
export const Localized = ({children}:any) => <>{children}</>;
export const PanelSection = ({title,children}:any) => <section className="settings-group"><h2>{title}</h2>{children}</section>;
export const PanelSectionRow = ({children}:any) => <div className="studio-native-row">{children}</div>;
export const Focusable = ({children,className}:any) => <div className={className}>{children}</div>;
export const DialogButton = ({children,...props}:any) => <button type="button" {...props}>{children}</button>;
export const ButtonItem = ({label,description,children,onClick,disabled}:any) => <div className="settings-row"><div className="row-main"><span className="label">{label}</span><button type="button" disabled={disabled} onClick={onClick}>{children}</button></div>{description&&<p className="hint">{description}</p>}</div>;
export function ToggleField({label,description,checked,disabled,onChange}:any) {
  const id=useId();return <div className="settings-row"><div className="switch-row"><label htmlFor={id}>{label}</label><input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={e=>onChange(e.target.checked)}/></div>{description&&<p className="hint">{description}</p>}</div>;
}
export function DropdownItem({label,description,selectedOption,rgOptions,onChange,disabled}:any) {
  const id=useId();return <div className="settings-row"><div className="row-main"><label htmlFor={id}>{label}</label><select id={id} value={selectedOption} disabled={disabled} onChange={e=>onChange(rgOptions.find((o:any)=>String(o.data)===e.target.value))}>{rgOptions.map((o:any)=><option key={o.data} value={o.data}>{o.label}</option>)}</select></div>{description&&<p className="hint">{description}</p>}</div>;
}
export function TextField({label,description,value,onChange,disabled,bIsPassword}:any) {
  if (bIsPassword) { disabled=true;value='';description='Credentials are disabled in this public preview. No key is accepted or transmitted.'; }
  const id=useId();return <div className="settings-row"><div className="row-main"><label htmlFor={id}>{label}</label><input id={id} type={bIsPassword?'password':'text'} value={value} onChange={onChange} disabled={disabled}/></div>{description&&<p className="hint">{description}</p>}</div>;
}
export function SliderField({label,value,min,max,step,onChange,disabled,valueSuffix}:any) {
  const id=useId();return <div className="settings-row"><label htmlFor={id}>{label} <output>{value}{valueSuffix}</output></label><input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={e=>onChange(Number(e.target.value))}/></div>;
}
