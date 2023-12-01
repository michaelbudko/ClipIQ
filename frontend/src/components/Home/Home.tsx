import { FormEvent, useState } from "react";
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import './Home.css';

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

function Home() {
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log(`Submitted YouTube URL: ${youtubeUrl}`);
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
                </StyledForm>
            </StyledContainer>
        </ThemeProvider>
    );
}

export default Home;
