// src/lib/AntdRegistry.tsx
'use client'; // Đảm bảo component này là Client Component

import React from 'react';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';

const AntdRegistry = ({ children }: React.PropsWithChildren) => {
  const cache = createCache();
  useServerInsertedHTML(() => (
    <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
  ));
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};

export default AntdRegistry;