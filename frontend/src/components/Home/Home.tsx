import { FormEvent, useState } from "react";
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import './Home.css';
import axios from "axios";

// Define a custom theme with Roboto font
const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
      },
  });

const StyledContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px', // Add your desired margin
});

const StyledForm = styled('form')({
    width: '30%', // Adjust width as needed
});

const LighterTextField = styled(TextField)({
    '& .MuiInputBase-root': {
      backgroundColor: '#394048', // Slightly lighter color
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

function Home() {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [error, setError] = useState('');
    const [audioFile, setAudioFile] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        // Validate YouTube link
        const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(youtubeUrl)) {
          setError('Please enter a valid YouTube link');
          setAudioFile('');
          return;
        }
    
        // If valid, make a request to Django endpoint
        try {
            const response = await axios.get(`http://localhost:8000/clipiq/download/?url=${encodeURIComponent(youtubeUrl)}`, {
              responseType: 'blob', // Important for handling binary data (e.g., an MP3 file)
            });
            // Create a Blob from the response data
            const blob = new Blob([response.data], { type: 'audio/mp3' });
            // Create a URL for the Blob and set it as the audio file
            const audioUrl = URL.createObjectURL(blob);
            setAudioFile(audioUrl);
            setError('');
          } catch (error) {
            console.error('Error fetching audio file:', error);
            setError('An error occurred while fetching the audio file');
            setAudioFile('');
          }
    };

    return (
        <ThemeProvider theme={theme}>
            <StyledContainer>
                <h1 style={{color: "white"}}>Download Youtube Audio</h1>
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
                                Get Audio
                            </GreenButton>
                            </InputAdornment>
                        ),
                        }}
                    />
                    {error && <ErrorText>{error}</ErrorText>}
                    {audioFile && <audio controls src={audioFile} />}
                </StyledForm>
            </StyledContainer>
        </ThemeProvider>
    );
}

export default Home;
