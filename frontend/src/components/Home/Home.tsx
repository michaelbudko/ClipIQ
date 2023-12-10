import { FormEvent, useState } from "react";
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
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
})

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

function Home() {
    const [youtubeUrl, setYoutubeUrl] = useState('');
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
            const response = await axios.get(`http://localhost:8000/clipiq/download/?url=${encodeURIComponent(youtubeUrl)}`);
            setTranscript(response.data.transcript); // Set the transcription text
            setError('');
        } catch (error) {
            console.error('Error fetching transcription:', error);
            setError('An error occurred while fetching the transcription');
            setTranscript('');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <StyledContainer>
                <h1 style={{color: "white"}}>Transcribe Youtube Audio</h1>
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
            </StyledContainer>
        </ThemeProvider>
    );
}

export default Home;
