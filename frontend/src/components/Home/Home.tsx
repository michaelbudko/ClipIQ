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
    width: '100%', // Make the image responsive
    height: 'auto',
    borderRadius: '4px', // Optional, for rounded corners
});

const SliderContainer = styled('div')({
    width: '60%', // Set the width to 60% of the screen size
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px auto', // Center the container
});

const TimeframeText = styled(Typography)({
    marginBottom: '10px',
});

const formatTime = (seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

function Home() {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoDetails, setVideoDetails] = useState({ title: '', thumbnail: '', duration: 0 });
    const [timeRange, setTimeRange] = useState([0, 0]); // [start, end]
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
                    <VideoThumbnailContainer>
                        <VideoThumbnail src={videoDetails.thumbnail} alt={videoDetails.title} />
                        <Typography variant="subtitle1">{videoDetails.title}</Typography>
                    </VideoThumbnailContainer>
                )}

                {videoDetails.duration > 0 && (
                    <SliderContainer>
                        <TimeframeText variant="subtitle1">Video timeframe</TimeframeText>
                        <Slider
                            value={timeRange}
                            onChange={(event: Event, newValue: number | number[]) => {
                                if (Array.isArray(newValue)) {
                                    setTimeRange(newValue as number[]);
                                }
                            }}
                            valueLabelDisplay="on"
                            valueLabelFormat={formatTime}
                            max={videoDetails.duration}
                        />
                    </SliderContainer>
                )}

            </StyledContainer>
        </ThemeProvider>
    );
}

export default Home;
