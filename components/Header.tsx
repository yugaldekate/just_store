import React from 'react';
import Image from 'next/image';

import Search from './Search';
import FileUploader from './FileUploader';
import { Button } from './ui/button';

const Header = () => {
    return (
        <header className='header'>
            <Search/>
            <div className='header-wrapper'>
                <FileUploader/>
                <form>
                    <Button type='submit' className='sign-out-button'>
                        <Image 
                            src="/assets/icons/logout.svg"
                            alt="sign-out"
                            height={24}
                            width={24}
                            className='w-6'
                        />
                    </Button>
                </form>
            </div>

        </header>
    )
}

export default Header