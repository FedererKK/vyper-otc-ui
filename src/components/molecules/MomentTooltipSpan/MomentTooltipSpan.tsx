import { Tooltip } from 'evergreen-ui';
import moment from 'moment';

type MomentTooltipSpanInput = {
	// date time value in milliseconds
	datetime: number;

	// optional timeformat string
	timeFormat?: string;
};

const MomentTooltipSpan = ({ datetime, timeFormat }: MomentTooltipSpanInput) => {
	return (
		<Tooltip content={moment(datetime).format(timeFormat ?? 'D MMM yyyy hh:mm a')} position="right">
			<p>{moment(datetime).fromNow()}</p>
		</Tooltip>
	);
};

export default MomentTooltipSpan;
