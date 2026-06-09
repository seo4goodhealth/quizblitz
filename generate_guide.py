import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, KeepTogether, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts (Liberation Serif = Times New Roman equivalent, Carlito = Calibri equivalent)
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')

# Palette
ACCENT = colors.HexColor('#26728c')
TEXT_PRIMARY = colors.HexColor('#1f1e1c')
TEXT_MUTED = colors.HexColor('#88857b')
BG_SURFACE = colors.HexColor('#e4e2dd')
BG_PAGE = colors.HexColor('#f0efed')

# Styles
title_style = ParagraphStyle(
    name='DocTitle', fontName='LiberationSerif-Bold', fontSize=28,
    leading=36, alignment=TA_CENTER, textColor=ACCENT,
    spaceBefore=20, spaceAfter=6
)
subtitle_style = ParagraphStyle(
    name='DocSubtitle', fontName='LiberationSerif', fontSize=14,
    leading=20, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceBefore=0, spaceAfter=24
)
h1_style = ParagraphStyle(
    name='H1', fontName='LiberationSerif-Bold', fontSize=20,
    leading=28, textColor=ACCENT, spaceBefore=24, spaceAfter=12
)
h2_style = ParagraphStyle(
    name='H2', fontName='LiberationSerif-Bold', fontSize=15,
    leading=22, textColor=ACCENT, spaceBefore=18, spaceAfter=8
)
h3_style = ParagraphStyle(
    name='H3', fontName='LiberationSerif-Bold', fontSize=12,
    leading=18, textColor=TEXT_PRIMARY, spaceBefore=12, spaceAfter=6
)
body_style = ParagraphStyle(
    name='Body', fontName='LiberationSerif', fontSize=10.5,
    leading=17, alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
    spaceBefore=0, spaceAfter=8
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='LiberationSerif', fontSize=10.5,
    leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    leftIndent=24, bulletIndent=12, spaceBefore=2, spaceAfter=4
)
code_style = ParagraphStyle(
    name='Code', fontName='Carlito', fontSize=9.5,
    leading=14, alignment=TA_LEFT, textColor=colors.HexColor('#2d2d2d'),
    backColor=colors.HexColor('#f5f5f5'), leftIndent=12,
    spaceBefore=4, spaceAfter=4, borderPadding=6
)
header_cell_style = ParagraphStyle(
    name='HeaderCell', fontName='LiberationSerif-Bold', fontSize=10,
    leading=14, alignment=TA_CENTER, textColor=colors.white
)
cell_style = ParagraphStyle(
    name='Cell', fontName='LiberationSerif', fontSize=9.5,
    leading=14, alignment=TA_LEFT, textColor=TEXT_PRIMARY
)
cell_center_style = ParagraphStyle(
    name='CellCenter', fontName='LiberationSerif', fontSize=9.5,
    leading=14, alignment=TA_CENTER, textColor=TEXT_PRIMARY
)

OUTPUT = '/home/z/my-project/download/QuizBlitz_App_Store_Submission_Guide.pdf'

doc = SimpleDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=1*inch, rightMargin=1*inch,
    topMargin=1*inch, bottomMargin=1*inch
)

story = []

# Title
story.append(Spacer(1, 40))
story.append(Paragraph('<b>QuizBlitz</b>', title_style))
story.append(Paragraph('App Store and Google Play Submission Guide', subtitle_style))
story.append(Spacer(1, 20))

# Horizontal rule
hr_data = [['']]
hr_table = Table(hr_data, colWidths=[doc.width])
hr_table.setStyle(TableStyle([
    ('LINEBELOW', (0, 0), (-1, 0), 1, ACCENT),
    ('TOPPADDING', (0, 0), (-1, -1), 0),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
]))
story.append(hr_table)
story.append(Spacer(1, 18))

# Intro
story.append(Paragraph(
    'This guide walks you through the entire process of publishing QuizBlitz to both the Apple App Store and Google Play Store. '
    'The app has been configured as a Capacitor-based hybrid application that wraps the live web deployment at '
    'https://quizblitz-beige.vercel.app inside native iOS and Android shells, giving you full access to both app stores '
    'while maintaining a single web codebase that updates automatically via Vercel deployments.',
    body_style
))

# Section 1: Prerequisites
story.append(Paragraph('<b>1. Prerequisites</b>', h1_style))
story.append(Paragraph(
    'Before you begin the submission process, ensure you have the following accounts, tools, and configurations '
    'in place. Missing any of these will block your submission at some point in the process, so it is best to '
    'prepare everything ahead of time rather than discovering gaps midway through.',
    body_style
))

story.append(Paragraph('<b>1.1 Apple Developer Account (for App Store)</b>', h2_style))
story.append(Paragraph(
    'You need an active Apple Developer Program membership to submit apps to the App Store. This costs $99 USD per year '
    'and must be renewed annually. Enroll at https://developer.apple.com/programs/ using your Apple ID. If you are '
    'enrolling as an organization (recommended for business apps), you will need your D-U-N-S number and legal entity '
    'documentation. The enrollment process typically takes 24-48 hours for individuals and up to 2 weeks for organizations '
    'due to identity verification. Once enrolled, you will have access to App Store Connect, Xcode, certificates, and '
    'provisioning profiles.',
    body_style
))
prereq_apple = [
    [Paragraph('<b>Item</b>', header_cell_style), Paragraph('<b>Details</b>', header_cell_style)],
    [Paragraph('Account Type', cell_style), Paragraph('Apple Developer Program (Individual or Organization)', cell_style)],
    [Paragraph('Cost', cell_style), Paragraph('$99 USD/year', cell_style)],
    [Paragraph('Enrollment URL', cell_style), Paragraph('https://developer.apple.com/programs/', cell_style)],
    [Paragraph('Required Software', cell_style), Paragraph('Xcode 15+ (macOS only)', cell_style)],
    [Paragraph('Processing Time', cell_style), Paragraph('24-48 hours (individual), 1-2 weeks (organization)', cell_style)],
]
t = Table(prereq_apple, colWidths=[doc.width*0.25, doc.width*0.75])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t)

story.append(Paragraph('<b>1.2 Google Play Developer Account (for Google Play)</b>', h2_style))
story.append(Paragraph(
    'Google Play requires a one-time registration fee of $25 USD. Unlike Apple, Google does not charge an annual fee. '
    'Register at https://play.google.com/console/signup using your Google account. You will need to verify your identity '
    'with a valid ID and complete a brief developer registration form. Google typically activates accounts within 1-2 '
    'business days, though it can occasionally take up to a week for new accounts to gain full access. Once active, '
    'you can create apps, set up store listings, and upload builds immediately.',
    body_style
))

story.append(Paragraph('<b>1.3 Development Environment</b>', h2_style))
story.append(Paragraph(
    'To build the native apps, you need the appropriate development tools installed on your machine. Android builds require '
    'Android Studio with the Android SDK (API level 34+), while iOS builds require Xcode running on macOS. The Capacitor CLI '
    'handles the bridge between your web code and the native projects. Node.js 18+ and npm are required to run the build '
    'scripts. The project already includes the android/ and ios/ directories with Capacitor configuration, so you do not '
    'need to initialize them from scratch.',
    body_style
))

# Section 2: Build Process
story.append(Paragraph('<b>2. Building the Native Apps</b>', h1_style))
story.append(Paragraph(
    'QuizBlitz uses Capacitor with a remote server URL, meaning the native apps act as thin wrappers that load the live '
    'web app from Vercel. This architecture has a major advantage: when you deploy updates to Vercel (via git push), the '
    'native apps automatically reflect those changes without requiring a new app store submission. However, changes to the '
    'native shell itself (permissions, splash screens, icons) do require a new build and submission.',
    body_style
))

story.append(Paragraph('<b>2.1 Android Build Steps</b>', h2_style))
steps_android = [
    'Install Android Studio from https://developer.android.com/studio',
    'Open the project: run <b>npm run cap:open:android</b> (or open the android/ folder in Android Studio)',
    'Wait for Gradle sync to complete (first time may take 5-10 minutes)',
    'In Android Studio, go to <b>Build > Generate Signed Bundle / APK</b>',
    'Select <b>Android App Bundle</b> (required for Play Store) and click Next',
    'Create a new keystore or select an existing one (keep the keystore file safe, you need it for all future updates)',
    'Select the <b>release</b> build variant',
    'Click <b>Finish</b> to generate the .aab file',
    'The output file will be at android/app/build/outputs/bundle/release/app-release.aab',
]
for i, step in enumerate(steps_android, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Spacer(1, 8))
story.append(Paragraph(
    'Important: Save your keystore file (.jks or .keystore) and passwords in a secure location. If you lose the keystore, '
    'you will not be able to update the app on Google Play and will need to create a new listing with a different package name. '
    'Consider using Google Play App Signing for additional security, which lets Google manage your signing key.',
    body_style
))

story.append(Paragraph('<b>2.2 iOS Build Steps</b>', h2_style))
steps_ios = [
    'Ensure Xcode 15+ is installed on your Mac (from the Mac App Store)',
    'Open the project: run <b>npm run cap:open:ios</b> (or open ios/App/App.xcworkspace in Xcode)',
    'In Xcode, select your Apple Developer team in Signing and Capabilities',
    'Set the Bundle Identifier to <b>com.quizblitz.app</b> (already configured in Capacitor)',
    'Select a physical device or "Any iOS Device" as the build target (simulator builds cannot be submitted)',
    'Go to <b>Product > Archive</b> to create an archive build',
    'Once archiving completes, the Organizer window opens automatically',
    'Click <b>Distribute App > App Store Connect</b> and follow the prompts',
    'Xcode uploads the build to App Store Connect automatically',
]
for i, step in enumerate(steps_ios, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Spacer(1, 8))
story.append(Paragraph(
    'The iOS build requires a Mac computer with Xcode. There is no way to build iOS apps on Windows or Linux. If you do '
    'not have access to a Mac, consider using cloud-based Mac services like MacStadium or AWS EC2 Mac instances. The build '
    'process typically takes 5-15 minutes depending on your internet connection speed for the upload to App Store Connect.',
    body_style
))

# Section 3: Google Play Submission
story.append(Paragraph('<b>3. Google Play Store Submission</b>', h1_style))
story.append(Paragraph(
    'Google Play has a relatively straightforward submission process compared to the App Store. Once your developer account '
    'is active and your AAB file is built, you can create the store listing and upload your app. Google reviews most apps '
    'within 1-3 days, though some categories may take up to 7 days. Here is a step-by-step walkthrough of the entire process.',
    body_style
))

story.append(Paragraph('<b>3.1 Create the App in Google Play Console</b>', h2_style))
gp_steps = [
    'Go to https://play.google.com/console and sign in with your developer account',
    'Click <b>Create app</b> in the top right corner',
    'Fill in the app details: App name = "QuizBlitz", Default language = English, Free or Paid = Free',
    'Select the app type: <b>App</b> (not Game, despite it being a quiz game - Google classifies quiz apps as Apps)',
    'Accept the Developer Program Policies and the US export laws declaration',
]
for i, step in enumerate(gp_steps, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Paragraph('<b>3.2 Store Listing Details</b>', h2_style))
story.append(Paragraph(
    'The store listing is what users see when they find your app on Google Play. A well-crafted listing significantly '
    'impacts download rates. Pay special attention to the app description, screenshots, and feature graphic as these '
    'are the primary conversion drivers.',
    body_style
))

store_data = [
    [Paragraph('<b>Field</b>', header_cell_style), Paragraph('<b>Content</b>', header_cell_style)],
    [Paragraph('App name', cell_style), Paragraph('QuizBlitz - Live Quiz Game', cell_style)],
    [Paragraph('Short description', cell_style), Paragraph('Create and join live quiz games with friends! 20+ categories, AI-generated questions, real-time multiplayer.', cell_style)],
    [Paragraph('Full description', cell_style), Paragraph('QuizBlitz is the ultimate live quiz game that brings friends together for exciting trivia battles! Create a room, share the code, and compete in real-time across 20+ categories including Science, History, Sports, Movies, and more. Features AI-generated questions for endless variety, time-based scoring, a Hall of Fame leaderboard, and support for 7 languages. Perfect for parties, classrooms, team building, or just challenging your knowledge!', cell_style)],
    [Paragraph('Category', cell_style), Paragraph('Trivia', cell_style)],
    [Paragraph('Tags', cell_style), Paragraph('Quiz, Trivia, Multiplayer, Party Game, Education', cell_style)],
    [Paragraph('Content rating', cell_style), Paragraph('Everyone (IARC questionnaire - answer all questions as no violence/mature content)', cell_style)],
    [Paragraph('Privacy policy URL', cell_style), Paragraph('https://quizblitz-beige.vercel.app/privacy (you need to create this page)', cell_style)],
    [Paragraph('Support URL', cell_style), Paragraph('https://quizblitz-beige.vercel.app/support (you need to create this page)', cell_style)],
]
t2 = Table(store_data, colWidths=[doc.width*0.25, doc.width*0.75])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('BACKGROUND', (0, 6), (-1, 6), BG_SURFACE),
    ('BACKGROUND', (0, 8), (-1, 8), BG_SURFACE),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t2)

story.append(Paragraph('<b>3.3 Required Assets for Google Play</b>', h2_style))
assets_gp = [
    [Paragraph('<b>Asset</b>', header_cell_style), Paragraph('<b>Size</b>', header_cell_style), Paragraph('<b>Notes</b>', header_cell_style)],
    [Paragraph('App icon', cell_style), Paragraph('512x512 PNG', cell_center_style), Paragraph('Already generated: public/icon-512.png', cell_style)],
    [Paragraph('Feature graphic', cell_style), Paragraph('1024x500 PNG', cell_center_style), Paragraph('Banner image shown at top of store listing', cell_style)],
    [Paragraph('Screenshots', cell_style), Paragraph('Min 2, Max 8', cell_center_style), Paragraph('Phone (16:9) and Tablet (7" & 10") screenshots', cell_style)],
    [Paragraph('Privacy policy', cell_style), Paragraph('Web page', cell_center_style), Paragraph('Required for all apps on Google Play', cell_style)],
]
t3 = Table(assets_gp, colWidths=[doc.width*0.20, doc.width*0.20, doc.width*0.60])
t3.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t3)

story.append(Paragraph('<b>3.4 Content Rating Questionnaire</b>', h2_style))
story.append(Paragraph(
    'Google Play requires all apps to complete the International Age Rating Coalition (IARC) questionnaire. For QuizBlitz, '
    'the answers are straightforward since the app contains no violence, sexual content, gambling, or mature themes. The '
    'questionnaire asks about the frequency and intensity of various content types. For QuizBlitz, you should answer "No" '
    'to all questions about violence, sexual content, controlled substances, gambling, and profanity. The resulting rating '
    'will be "Everyone" across all regions, which is ideal for maximizing your potential audience. Be honest in your answers, '
    'as misrepresentation can result in app removal and potential account suspension.',
    body_style
))

story.append(Paragraph('<b>3.5 Upload and Review</b>', h2_style))
story.append(Paragraph(
    'After completing the store listing and content rating, navigate to the Production track in the Google Play Console. '
    'Click "Create new release" and upload the .aab file you generated in Step 2.1. Google Play will process the bundle '
    'and run automated checks. Review any warnings or errors that appear. Once the upload is successful, add release notes '
    '(e.g., "Initial release of QuizBlitz - Live Quiz Game!"), review all the information one final time, and click '
    '"Start rollout to Production." Google typically reviews new apps within 1-3 business days, though it can occasionally '
    'take up to 7 days. You will receive an email notification when the review is complete and the app is live on Google Play.',
    body_style
))

# Section 4: Apple App Store Submission
story.append(Paragraph('<b>4. Apple App Store Submission</b>', h1_style))
story.append(Paragraph(
    'The Apple App Store submission process is more rigorous and time-consuming than Google Play. Apple manually reviews '
    'each app submission, and the review process typically takes 24-48 hours for new apps, though it can extend to several '
    'days if the reviewer has questions or requests changes. The most common reasons for rejection include: missing privacy '
    'policy, crashing on launch, placeholder content, requesting unnecessary permissions, and poor user interface design. '
    'QuizBlitz should pass review easily since it is a functional, well-designed app with clear purpose.',
    body_style
))

story.append(Paragraph('<b>4.1 App Store Connect Setup</b>', h2_style))
as_steps = [
    'Go to https://appstoreconnect.apple.com and sign in with your Apple Developer account',
    'Click <b>My Apps > + > New App</b>',
    'Select iOS as the platform, enter "QuizBlitz" as the name, choose your primary language (English)',
    'Set the Bundle ID to <b>com.quizblitz.app</b> (must match the Capacitor config exactly)',
    'Set the SKU to "quizblitz1" (internal identifier, can be anything unique)',
    'Select <b>Full Access</b> for App Store access level',
]
for i, step in enumerate(as_steps, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Paragraph('<b>4.2 App Information</b>', h2_style))
as_info = [
    [Paragraph('<b>Field</b>', header_cell_style), Paragraph('<b>Content</b>', header_cell_style)],
    [Paragraph('App Name', cell_style), Paragraph('QuizBlitz', cell_style)],
    [Paragraph('Subtitle', cell_style), Paragraph('Live Multiplayer Quiz Game', cell_style)],
    [Paragraph('Primary Category', cell_style), Paragraph('Games > Trivia', cell_style)],
    [Paragraph('Secondary Category', cell_style), Paragraph('Education', cell_style)],
    [Paragraph('Age Rating', cell_style), Paragraph('4+ (Infrequent/Mild Competition)', cell_style)],
    [Paragraph('Privacy Policy URL', cell_style), Paragraph('https://quizblitz-beige.vercel.app/privacy', cell_style)],
    [Paragraph('Support URL', cell_style), Paragraph('https://quizblitz-beige.vercel.app/support', cell_style)],
    [Paragraph('Copyright', cell_style), Paragraph('2026 QuizBlitz. All rights reserved.', cell_style)],
]
t4 = Table(as_info, colWidths=[doc.width*0.25, doc.width*0.75])
t4.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('BACKGROUND', (0, 6), (-1, 6), BG_SURFACE),
    ('BACKGROUND', (0, 8), (-1, 8), BG_SURFACE),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t4)

story.append(Paragraph('<b>4.3 Required Assets for App Store</b>', h2_style))
assets_as = [
    [Paragraph('<b>Asset</b>', header_cell_style), Paragraph('<b>Dimensions</b>', header_cell_style), Paragraph('<b>Notes</b>', header_cell_style)],
    [Paragraph('App Icon', cell_style), Paragraph('1024x1024 PNG', cell_center_style), Paragraph('No alpha channel, no rounded corners (iOS adds them)', cell_style)],
    [Paragraph('iPhone 6.7" screenshots', cell_style), Paragraph('1290x2796 or 2796x1290', cell_center_style), Paragraph('Required - iPhone 15 Pro Max / 14 Pro Max', cell_style)],
    [Paragraph('iPhone 6.5" screenshots', cell_style), Paragraph('1284x2778 or 2778x1284', cell_center_style), Paragraph('Required - iPhone 14 Plus / 13 Pro Max', cell_style)],
    [Paragraph('iPad Pro 12.9" screenshots', cell_style), Paragraph('2048x2732 or 2732x2048', cell_center_style), Paragraph('Optional but recommended', cell_style)],
]
t5 = Table(assets_as, colWidths=[doc.width*0.25, doc.width*0.30, doc.width*0.45])
t5.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t5)

story.append(Paragraph('<b>4.4 Submitting for Review</b>', h2_style))
story.append(Paragraph(
    'Once your build is uploaded (via Xcode Archive > Distribute App), it will appear in App Store Connect under the '
    'Build section. Select the build, fill in the "What\'s New" field (e.g., "Welcome to QuizBlitz! Create and join live '
    'quiz games with friends across 20+ categories."), verify all the metadata is correct, and click "Submit for Review." '
    'Apple will email you when the review starts and again when a decision is made. If the app is rejected, Apple provides '
    'specific guidance on what needs to change. Common issues for first-time submissions include missing privacy policy, '
    'crashes during review, or placeholder text. QuizBlitz should not have these issues since it is a fully functional app.',
    body_style
))

# Section 5: Privacy Policy
story.append(Paragraph('<b>5. Privacy Policy (Required)</b>', h1_style))
story.append(Paragraph(
    'Both Apple and Google require a privacy policy URL for all apps. You need to create a privacy policy page on your '
    'website. The privacy policy should cover the following key areas: what data you collect (player names, game scores, '
    'quiz answers), how you use the data (for gameplay, leaderboard rankings), third-party services you use (Vercel for '
    'hosting, OpenAI for question generation), data retention policies, and contact information. You can use a free privacy '
    'policy generator like https://www.privacypolicies.com/ or https://termly.io/ as a starting point, but make sure to '
    'customize it for QuizBlitz specifically. The privacy policy page must be accessible at a public URL before you submit '
    'the app for review. A simple approach is to create a /privacy route in your Next.js app.',
    body_style
))

# Section 6: Capacitor Configuration Details
story.append(Paragraph('<b>6. Current Capacitor Configuration</b>', h1_style))
story.append(Paragraph(
    'The project is already configured with Capacitor for both Android and iOS. Here are the key configuration details '
    'that have been set up in the capacitor.config.ts file and the native project directories. Understanding these settings '
    'is important for troubleshooting and future updates.',
    body_style
))

config_data = [
    [Paragraph('<b>Setting</b>', header_cell_style), Paragraph('<b>Value</b>', header_cell_style), Paragraph('<b>Purpose</b>', header_cell_style)],
    [Paragraph('appId', cell_style), Paragraph('com.quizblitz.app', cell_style), Paragraph('Unique identifier for both stores', cell_style)],
    [Paragraph('appName', cell_style), Paragraph('QuizBlitz', cell_style), Paragraph('Display name on device home screen', cell_style)],
    [Paragraph('server.url', cell_style), Paragraph('https://quizblitz-beige.vercel.app', cell_style), Paragraph('Live web app URL (auto-updates)', cell_style)],
    [Paragraph('Splash duration', cell_style), Paragraph('2000ms', cell_style), Paragraph('Splash screen visible for 2 seconds', cell_style)],
    [Paragraph('Splash background', cell_style), Paragraph('#0f0f23', cell_style), Paragraph('Dark background matching app theme', cell_style)],
    [Paragraph('Status bar style', cell_style), Paragraph('DARK', cell_style), Paragraph('White status bar icons on dark bg', cell_style)],
]
t6 = Table(config_data, colWidths=[doc.width*0.22, doc.width*0.38, doc.width*0.40])
t6.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('BACKGROUND', (0, 6), (-1, 6), BG_SURFACE),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t6)

# Section 7: App Architecture
story.append(Paragraph('<b>7. App Architecture and Update Flow</b>', h1_style))
story.append(Paragraph(
    'QuizBlitz uses a Capacitor "remote URL" architecture. This means the native app shell opens a WebView that loads the '
    'live web application from your Vercel deployment. The architecture has significant implications for how updates work '
    'and what requires a new app store submission versus what can be updated instantly.',
    body_style
))

story.append(Paragraph('<b>7.1 What Updates Automatically (No App Store Resubmission)</b>', h2_style))
auto_updates = [
    'UI/UX changes to the web app (colors, layout, text, animations)',
    'New quiz categories and question banks added to the server',
    'Bug fixes in the web app (JavaScript, CSS, API endpoints)',
    'New features added to the web app (new game modes, settings)',
    'Translation updates and language additions',
    'Performance optimizations (faster polling, better caching)',
    'AI question generation improvements',
    'Hall of Fame and leaderboard changes',
]
for item in auto_updates:
    story.append(Paragraph(f'- {item}', bullet_style))

story.append(Paragraph('<b>7.2 What Requires a New App Store Submission</b>', h2_style))
manual_updates = [
    'Changes to the app icon or splash screen',
    'Changes to the app name, bundle ID, or permissions',
    'Updates to the Capacitor plugins or native configuration',
    'Changes to the server URL in capacitor.config.ts',
    'Adding new native features (push notifications, camera access, etc.)',
    'Updates required by OS changes (new Android/iOS version requirements)',
]
for item in manual_updates:
    story.append(Paragraph(f'- {item}', bullet_style))

# Section 8: Timeline and Costs
story.append(Paragraph('<b>8. Timeline and Costs Summary</b>', h1_style))
timeline_data = [
    [Paragraph('<b>Step</b>', header_cell_style), Paragraph('<b>Duration</b>', header_cell_style), Paragraph('<b>Cost</b>', header_cell_style)],
    [Paragraph('Apple Developer Account', cell_style), Paragraph('1-7 days', cell_center_style), Paragraph('$99/year', cell_center_style)],
    [Paragraph('Google Play Developer Account', cell_style), Paragraph('1-2 days', cell_center_style), Paragraph('$25 one-time', cell_center_style)],
    [Paragraph('Privacy Policy creation', cell_style), Paragraph('1-2 hours', cell_center_style), Paragraph('Free', cell_center_style)],
    [Paragraph('Screenshot generation', cell_style), Paragraph('1-2 hours', cell_center_style), Paragraph('Free', cell_center_style)],
    [Paragraph('Android build and upload', cell_style), Paragraph('30 min', cell_center_style), Paragraph('Free', cell_center_style)],
    [Paragraph('iOS build and upload', cell_style), Paragraph('30 min + Mac required', cell_center_style), Paragraph('Free (Mac needed)', cell_center_style)],
    [Paragraph('Google Play review', cell_style), Paragraph('1-3 days', cell_center_style), Paragraph('Free', cell_center_style)],
    [Paragraph('Apple App Store review', cell_style), Paragraph('1-3 days', cell_center_style), Paragraph('Free', cell_center_style)],
    [Paragraph('<b>Total</b>', cell_style), Paragraph('<b>~1-2 weeks</b>', cell_center_style), Paragraph('<b>$124 minimum</b>', cell_center_style)],
]
t7 = Table(timeline_data, colWidths=[doc.width*0.40, doc.width*0.30, doc.width*0.30])
t7.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('BACKGROUND', (0, 6), (-1, 6), BG_SURFACE),
    ('BACKGROUND', (0, 8), (-1, 8), BG_SURFACE),
    ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#d4e8ef')),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t7)

# Section 9: Tips
story.append(Paragraph('<b>9. Pro Tips for a Smooth Submission</b>', h1_style))

story.append(Paragraph('<b>9.1 Before Submitting</b>', h2_style))
tips_before = [
    'Test the app thoroughly on at least one real Android device and one real iOS device. Make sure the app loads, games can be created, and multiplayer works.',
    'Create a privacy policy page before starting the submission. Both stores require it and will reject without one.',
    'Take high-quality screenshots on actual devices. Avoid simulator/emulator screenshots if possible, as they look noticeably different from real device output.',
    'Prepare a feature graphic (1024x500) for Google Play. This is the large banner at the top of your store listing and is the first thing users see.',
    'Make sure the app does not crash on launch, especially on slow internet connections. The Capacitor remote URL approach means the app needs internet access to function. Consider adding an offline fallback screen.',
]
for tip in tips_before:
    story.append(Paragraph(f'- {tip}', bullet_style))

story.append(Paragraph('<b>9.2 Common Rejection Reasons to Avoid</b>', h2_style))
tips_avoid = [
    '<b>No privacy policy</b>: The most common rejection reason. Your privacy policy must be a publicly accessible URL.',
    '<b>App crashes on launch</b>: Test on slow networks and ensure the WebView loads gracefully.',
    '<b>Placeholder content</b>: Make sure all UI elements have real content, no "Lorem ipsum" or "Coming soon" text.',
    '<b>Requesting unnecessary permissions</b>: QuizBlitz only needs INTERNET permission. Do not add location, camera, or contacts permissions.',
    '<b>Web wrapper without native feel</b>: Apple sometimes rejects "minimal web wrappers." Ensure the app has a proper splash screen, icon, and smooth navigation that feels native.',
    '<b>Missing App Tracking Transparency prompt</b>: If you ever add ad tracking, you must include the iOS ATT prompt.',
]
for tip in tips_avoid:
    story.append(Paragraph(f'- {tip}', bullet_style))

story.append(Paragraph('<b>9.3 Post-Submission</b>', h2_style))
story.append(Paragraph(
    'After your app is approved and live on both stores, there are several things you should do to maximize visibility '
    'and user acquisition. First, create a landing page on your website that links directly to both the App Store and '
    'Google Play listings. Share the links on social media and relevant communities. Consider creating a short demo video '
    'showing the multiplayer experience. Monitor your store analytics regularly to track downloads, ratings, and reviews. '
    'Respond promptly to user reviews, especially negative ones, as this shows active development and care for users. '
    'Plan regular updates (even minor ones like "bug fixes and improvements") to keep the app visible in "Recently Updated" '
    'sections of the stores. Remember that thanks to the Capacitor remote URL architecture, most feature updates happen '
    'automatically via Vercel without needing to resubmit the app.',
    body_style
))

# Section 10: Useful Commands
story.append(Paragraph('<b>10. Useful Development Commands</b>', h1_style))
story.append(Paragraph(
    'The following npm scripts are available in the project to help with the build and deployment workflow. These commands '
    'handle the complete pipeline from building the Next.js web app to syncing assets with the native Capacitor projects '
    'and opening the native IDEs for final builds.',
    body_style
))

cmd_data = [
    [Paragraph('<b>Command</b>', header_cell_style), Paragraph('<b>Description</b>', header_cell_style)],
    [Paragraph('npm run build', cell_style), Paragraph('Build Next.js with webpack (required for PWA) and copy standalone output', cell_style)],
    [Paragraph('npm run build:cap', cell_style), Paragraph('Build Next.js and sync with Capacitor (android + ios)', cell_style)],
    [Paragraph('npm run cap:sync', cell_style), Paragraph('Sync web assets to android/ and ios/ native projects', cell_style)],
    [Paragraph('npm run cap:open:android', cell_style), Paragraph('Open the Android project in Android Studio', cell_style)],
    [Paragraph('npm run cap:open:ios', cell_style), Paragraph('Open the iOS project in Xcode (macOS only)', cell_style)],
    [Paragraph('npm run cap:run:android', cell_style), Paragraph('Build and run on connected Android device/emulator', cell_style)],
    [Paragraph('npm run cap:run:ios', cell_style), Paragraph('Build and run on connected iOS device/simulator', cell_style)],
]
t8 = Table(cmd_data, colWidths=[doc.width*0.35, doc.width*0.65])
t8.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SURFACE),
    ('BACKGROUND', (0, 4), (-1, 4), BG_SURFACE),
    ('BACKGROUND', (0, 6), (-1, 6), BG_SURFACE),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(t8)

# Build the document
doc.build(story)
print(f'PDF generated: {OUTPUT}')
