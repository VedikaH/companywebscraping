const puppeteer = require('puppeteer');

// const location = process.argv[2];

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
}

async function getComapnyData(companyLink){
    const browser = await puppeteer.launch({
        args: ['--start-maximized', '--incognito','--no-sandbox'],
        headless: true,
        defaultViewport: null
    });
    const page = (await browser.pages())[0];

    let [companyName, companyLocation, companyIndustry, companySize, companyFounded, companyWebsite, companySpecialities] = Array(7).fill('N/A');
    await page.goto(companyLink);
    console.log(companyLink)
    try{
        await page.waitForSelector('section[data-test-id="about-us"]', {timeout: 10000});

        companyName = await page.$eval('h1.top-card-layout__title', el => el.textContent.trim()).catch(() => 'N/A');
        companyIndustry = await page.$eval('div[data-test-id="about-us__industry"] > dd', el => el.textContent.trim()).catch(() => 'N/A');
        companyLocation = await page.$eval('div[data-test-id="about-us__headquarters"] > dd', el => el.textContent.trim()).catch(() => 'N/A'); 
        companySize = await page.$eval('div[data-test-id="about-us__size"] > dd', el => el.textContent.trim()).catch(() => 'N/A'); 

        // companySize = await page.$eval('p.face-pile__text', el => {
        //     const match = el.textContent.trim().match(/\d+(?:,\d+)*/);
        //     return match ? match[0] : 'N/A';
        // }).catch(async () => {
        //     return await page.$eval('div[data-test-id="about-us__size"] > dd', el => el.textContent.trim()).catch(() => 'N/A');
        // }); 
        companyFounded =  await page.$eval('div[data-test-id="about-us__foundedOn"] dd', el => el.textContent.trim()).catch(() => 'N/A');
        companyWebsite = await page.$eval('a[data-tracking-control-name="about_website"]', el => el.textContent.trim()).catch(() => 'N/A');
        companySpecialities = await page.$eval('div[data-test-id="about-us__specialties"] dd', el => el.textContent.trim()).catch(() => 'N/A');

        await browser.close();
        return {
            'Name': companyName,
            'Industry': companyIndustry,
            'Location': companyLocation,
            'Size': companySize,
            'Establish Date': companyFounded,
            'Website': companyWebsite,
            'Specialities': companySpecialities
        };
    }
    catch(error){
        console.log(error.message)
        await browser.close();
        return null
    }
    
}

(async () => {
    // console.log(location)
    // const response = await fetch(`https://script.google.com/macros/s/AKfycby8T6BFSlmcTG-wuWMWK-a5CGEEKvYFmoTeGNNQm8e01pYC8feuK0taBU_EOc1NpvYYpQ/exec?type=linkedin&location=${location}`);
    const response = await fetch('https://script.google.com/macros/s/AKfycbw6iVcHzvAjGAwuiOYWnRiZQaMxxKeiF0_23F3K9eDTAB32ZWwxjAr5-4ozMlKqVlYieA/exec');
    const urls = await response.json();
    console.log(urls.length)
    let result = {}
    for (const url of urls) {
        let companyData = {
            'Company Name': 'N/A',
            'Industry': 'N/A',
            'Location': 'N/A',
            'Size': 'N/A',
            'Establish Date': 'N/A',
            'Website': 'N/A',
            'Specialities': 'N/A'
        }
        try{
            companyData = await getComapnyData(url);
            console.log(companyData)
            if(companyData != null){
                result[url] = companyData;
                // if(Object.keys(result).length >= 100)
                //     break
            }
            await delay(2000)
        }
        catch(error){
            console.log(error)
        }
    }

    try {
        const payload = JSON.stringify({
            // 'source': 'linkedin',
            'data': result,
            // 'location': location
        })
        const response = await fetch("https://script.google.com/macros/s/AKfycbykhEXZEg-144m8Fje9-O88N_pIch9P91xEfdeSMRQOTgdlfQBZ8zg0mw91XqTImsto/exec", {
        // const response = await fetch("https://script.google.com/macros/s/AKfycbwom6N1wuQgsBEZj-rSsbWZyKqROXfpVqKjxFOWRRb_jkrPQ4Uzj4mRwT_TbenwaoKgpg/exec", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();
