import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { SelectButton } from 'primereact/selectbutton';

import { updateLocalesThunk, useLocaleAction } from '../../store/locales/actions';
import CONSTANTS from '../../constants/common';
import { useUser } from 'store/hooks';

import './LanguageBox.scss';

const LANGUAGES = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'English', value: 'en' },
  { label: '繁体中文', value: 'zh-trade' },
  { label: '简体中文', value: 'zh' },
];

const MOBILE_LANGUAGES = [
  { label: 'VN', value: 'vi' },
  { label: 'EN', value: 'en' },
  { label: 'TW', value: 'zh-trade' },
  { label: 'CN', value: 'zh' },
];

function LanguageBox() {
  const [language, setLanguage] = useState<string>('');
  const dispatch = useDispatch();
  const locale = useLocaleAction();
  const user = useUser();

  function changeHandler(event: any) {
    const selecttedLang = event.value    
    setLanguage(selecttedLang);
    dispatch(updateLocalesThunk(selecttedLang));
    localStorage.setItem(CONSTANTS.STORAGE_KEY.LANGUAGE, selecttedLang);
  }

  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  return (
    <>
      <div className={`d-sm-inline-flex ${!user.status ? '' : 'd-none'}`}>
        <Dropdown
          className="languages-box tw-flex tw-items-center"
          value={language}
          options={LANGUAGES}
          onChange={changeHandler}
          placeholder="Select a Language"
          data-tip={`Click to switch to ${language === 'en' ? 'Chinese' : 'English'}`} 
          data-for={'language-tooltip'}
        />
      </div> 
      <SelectButton value={language} options={MOBILE_LANGUAGES} onChange={changeHandler} className={`d-sm-none ${!user.status ? 'd-none' : 'd-inline-flex'}`} /> 
      <ReactTooltip id={'language-tooltip'} place="top" type="dark" effect="float" multiline={true} />
    </>
  );
}

export default LanguageBox;
