'use client';

import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import type { SvgIconProps } from '@mui/material';
import { getDocumentKind } from '@/utils/documents/documentKind';

type DocumentTypeIconProps = {
  mimeType?: string | null;
  fileName?: string | null;
} & SvgIconProps;

export function DocumentTypeIcon({ mimeType, fileName, ...props }: DocumentTypeIconProps) {
  const kind = getDocumentKind(mimeType ?? null, fileName ?? null);

  if (kind === 'pdf') {
    return <PictureAsPdfOutlinedIcon {...props} />;
  }

  if (kind === 'code' || kind === 'markdown') {
    return <CodeOutlinedIcon {...props} />;
  }

  if (kind === 'unknown') {
    return <DescriptionOutlinedIcon {...props} />;
  }

  return <ArticleOutlinedIcon {...props} />;
}
