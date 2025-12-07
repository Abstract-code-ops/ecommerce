import TextPressure from '@/components/ui/shadcn-io/text-pressure';

export interface TextPressureClientProps {
  text: string;
  flex: boolean;
  alpha: boolean;
  stroke: boolean;
  width: boolean;
  weight: boolean;
  italic: boolean;
  minFontSize: number;
  className: string;
}

type Props = {};

const TextPressureClient: React.FC<TextPressureClientProps> = ({ text, flex, alpha, stroke, width, weight, italic, minFontSize, className }) => {
  return <TextPressure text={text} flex={flex} alpha={alpha} stroke={stroke} width={width} weight={weight} italic={italic} minFontSize={minFontSize} className={className} />;
};

export default TextPressureClient;