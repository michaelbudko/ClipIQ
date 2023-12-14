import { FormEvent, useState } from "react";
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import './Home.css';
import axios from "axios";

const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

const StyledContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
});

const StyledForm = styled('form')({
    width: '30%',
});

const LighterTextField = styled(TextField)({
    '& .MuiInputBase-root': {
        backgroundColor: '#394048',
    },
});

const GreenButton = styled(Button)({
    backgroundColor: 'rgb(17,180,52)',
    color: 'fff',
});

const ErrorText = styled('p')({
    color: 'orange',
    marginTop: '10px',
});

const TranscriptText = styled('p')({
    color: 'white',
    marginTop: '20px',
    textAlign: 'left',
    wordBreak: 'break-word', // Ensures long text wraps and doesn't overflow
});

const VideoThumbnailContainer = styled('div')({
    width: '100%', // Adjust the width as needed
    maxWidth: '500px', // Set a maximum width
    height: 'auto', // Adjust height as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
});

const VideoThumbnail = styled('img')({
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' // Light shadow around the thumbnail
});

const TimeframeText = styled(Typography)({
    marginBottom: '10px',
});

const formatTime = (seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const TimeframeContainer = styled('div')({
    backgroundColor: '#505C66', // Slightly lighter background color
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Optional shadow for depth
    width: '40%',
    margin: '20px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
});

const calculateCreditsUsed = (range: any) => {
    const minutes = Math.ceil((range[1] - range[0]) / 60);
    return `Credits used: ${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

const VideoDetailsContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Centers content vertically in the container
    textAlign: 'center',
    width: '100%', // Adjust as needed
    margin: '20px 0'
});

interface InterestingIndex {
    start: number;
    end: number;
}

function Home() {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoDetails, setVideoDetails] = useState({ title: '', thumbnail: '', duration: 0 });
    const [timeRange, setTimeRange] = useState([0, 0]); // [start, end]
    const [interestingIndexes, setInterestingIndexes] = useState<InterestingIndex[]>([]);
    const [error, setError] = useState('');
    const [transcript, setTranscript] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(youtubeUrl)) {
            setError('Please enter a valid YouTube link');
            setTranscript('');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8000/clipiq/get-video-details/?url=${encodeURIComponent(youtubeUrl)}`);
            const details = response.data;
            setVideoDetails({
                title: details.title,
                thumbnail: details.thumbnail_url,
                duration: details.duration 
            });
            setTimeRange([0, details.duration]);
            setError('');

            const interestingResponse = await axios.get(`http://localhost:8000/clipiq/download/?url=${encodeURIComponent(youtubeUrl)}`);
            setInterestingIndexes(interestingResponse.data.interesting_indexes);
    
            setError('');
        } catch (fetchError) {
            console.error('Error fetching video details:', fetchError);
            setError('An error occurred while fetching the video details');
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <StyledContainer>
                <h1 style={{ color: "white" }}>Get Clips Instantly</h1>
                <StyledForm onSubmit={handleSubmit}>
                    <LighterTextField
                        label="YouTube URL"
                        variant="outlined"
                        value={youtubeUrl}
                        autoComplete="off"
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            style: { color: '#AAA' },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <GreenButton variant="contained" color="primary" type="submit">
                                        Transcribe
                                    </GreenButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {error && <ErrorText>{error}</ErrorText>}
                    {transcript && <TranscriptText>{transcript}</TranscriptText>}
                </StyledForm>

                {videoDetails.thumbnail && (
                    <VideoDetailsContainer>
                        <Typography variant="subtitle1" style={{ color: 'white' }}>{videoDetails.title}</Typography>
                        <VideoThumbnailContainer>
                            <VideoThumbnail src={videoDetails.thumbnail} alt={videoDetails.title} />
                        </VideoThumbnailContainer>
                    </VideoDetailsContainer>
                )}

                {videoDetails.duration > 0 && (
                    <TimeframeContainer>
                        <TimeframeText variant="subtitle1"> {calculateCreditsUsed(timeRange)}</TimeframeText>
                        <Slider
                            value={timeRange}
                            onChange={(event, newValue) => {
                                if (Array.isArray(newValue)) {
                                    setTimeRange(newValue as number[]);
                                }
                            }}
                            valueLabelDisplay="on"
                            valueLabelFormat={formatTime}
                            max={videoDetails.duration}
                        />
                    </TimeframeContainer>
                )}

                {interestingIndexes.length > 0 && (
                    <div>
                        <Typography variant="h6" style={{ color: 'white', marginTop: '20px' }}>
                            Interesting Moments:
                        </Typography>
                        <ul>
                            {interestingIndexes.map((index, idx) => (
                                <li key={idx} style={{ color: 'white' }}>
                                    Start: {index.start}, End: {index.end}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </StyledContainer>
        </ThemeProvider>
    );
}

export default Home;
